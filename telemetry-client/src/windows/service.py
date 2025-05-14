import win32serviceutil
import win32service
import win32event
import servicemanager
import threading
import asyncio
import logging
import time

import yaml

from logic.catmonit_client import TelemetryStream
import os

SERVICE_NAME = "CatMonitTelemetryClient"
SERVICE_DISPLAY_NAME = "CatMonit Telemetry Client"
SERVICE_DESCRIPTION = "Sends telemetry data to CatMonit server."

# Setup logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] [%(threadName)s] %(name)s: %(message)s',
    handlers=[logging.FileHandler("catmonit_service.log"), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)


class CatMonitTelemetryClient(win32serviceutil.ServiceFramework):
    _svc_name_ = SERVICE_NAME
    _svc_display_name_ = SERVICE_DISPLAY_NAME
    _svc_description_ = SERVICE_DESCRIPTION

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.stop_event = threading.Event()
        self.started_event = threading.Event()
        self.worker_thread = threading.Thread(target=self.main_service_logic, name="CatMonitWorker")
        self.telemetry = None
        logger.info("CatMonitTelemetryClient: Service __init__ completed.")

    def SvcDoRun(self):
        logger.info("CatMonitTelemetryClient: SvcDoRun entered.")

        # Set Windows Proactor event loop policy
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        logger.debug("CatMonitTelemetryClient: Using proactor: WindowsProactorEventLoopPolicy")

        self.ReportServiceStatus(self._svc_name_, win32service.SERVICE_START_PENDING)
        self.worker_thread.start()
        self.ReportServiceStatus(win32service.SERVICE_RUNNING)
        logger.info("CatMonitTelemetryClient: Worker thread started.")

        logger.info("Waiting for service logic to confirm startup...")
        if self.started_event.wait(timeout=25):
            logger.info("Reported SERVICE_RUNNING. Waiting for stop event.")
        else:
            logger.error("Timed out waiting for service logic to start.")
            self.SvcStop()
            return

        self.stop_event.wait()
        logger.info("Stop event received in SvcDoRun.")
        logger.info("SvcDoRun is exiting.")

    def SvcStop(self):
        logger.info("SvcStop called.")
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        logger.info("Requesting asyncio loop to stop.")
        self.stop_event.set()
        logger.info("Waiting for worker thread to join.")
        self.worker_thread.join()
        logger.info("Worker thread joined successfully.")
        self.ReportServiceStatus(win32service.SERVICE_STOPPED)
        logger.info("Service reported as STOPPED.")

    def main_service_logic(self):
        logger.info("main_service_logic (worker thread) started.")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        logger.info("Asyncio event loop created and set for worker thread.")
        try:
            loop.run_until_complete(self.run_main_async())
        except Exception as e:
            logger.exception("Unhandled exception in worker thread (main_service_logic): %s", e)
        finally:
            logger.info("main_service_logic (worker thread) attempting to close asyncio loop.")
            loop.close()
            logger.info("Asyncio loop closed.")
            logger.info("main_service_logic (worker thread) finished.")

    async def run_main_async(self):
        logger.info("run_main_async started.")
        try:
            self.telemetry = TelemetryStream()
            config = load_config()
            server = config.get("server_address", "localhost")
            port = config.get("server_port", "5001")
            await self.telemetry.open_stream(server, port)  # Pass self to signal start
        except Exception as e:
            logger.exception("run_main_async finished with exception: %s", e)
        logger.info("run_main_async finished.")

def load_config():
    path = os.path.join(os.environ.get("PROGRAM_FILES", "C:\\Program Files"), "CatMonit Telemetry Client", "config.yaml")
    logging.info(f"Loading config from {path}")
    try:
        with open(path, "r") as f:
            return yaml.safe_load(f)
    except Exception as e:
        logging.exception("Failed to load config file")
        raise

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(CatMonitTelemetryClient)
