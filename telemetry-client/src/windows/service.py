import threading
import win32serviceutil
import win32service
import win32event
import servicemanager
import os
import sys
import yaml
import asyncio

from logic.catmonit_client import TelemetryStream

import logging
logging.basicConfig(
    filename="C:\\Program Files\\CatMonit Telemetry Client\\telemetry.log",
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

class CatMonitService(win32serviceutil.ServiceFramework):
    _svc_name_ = "CatMonitTelemetryClient"
    _svc_display_name_ = "CatMonit Telemetry Client"
    _svc_description_ = "Pushes telemetry data to a central server using gRPC."

    def __init__(self, args):
        super().__init__(args)
        self.stop_event = win32event.CreateEvent(None, 0, 0, None)
        self.running = True
        self.loop = asyncio.new_event_loop()

    def SvcStop(self):
        logging.info("Service stop requested")
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        self.running = False
        win32event.SetEvent(self.stop_event)
        self.loop.call_soon_threadsafe(self.loop.stop)

    def SvcDoRun(self):
        servicemanager.LogInfoMsg("CatMonit Telemetry service is starting...")
        logging.info("SvcDoRun started")

        thread = threading.Thread(target=self.run_async_main, daemon=True)
        thread.start()

        self.ReportServiceStatus(win32service.SERVICE_RUNNING)
        win32event.WaitForSingleObject(self.stop_event, win32event.INFINITE)
        logging.info("SvcDoRun exiting")

    def run_async_main(self):
        asyncio.set_event_loop(self.loop)
        try:
            self.loop.run_until_complete(self.run_main())
        except Exception as e:
            logging.exception("Async main loop crashed: %s", e)
        finally:
            self.loop.close()
            logging.info("Async loop closed")

    async def run_main(self):
        try:
            config = load_config()
            logging.info(f"Loaded config: {config}")

            stream = TelemetryStream()
            await stream.open_stream(
                config.get("server_address", "localhost"),
                config.get("server_port", "5001")
            )
        except Exception as e:
            logging.exception("Error in run_main: %s", e)


def load_config():
    path = os.path.join(os.environ.get("PROGRAM_FILES", "C:\\Program Files"), "CatMonit Telemetry Client", "config.yaml")

    with open(path, "r") as f:
        return yaml.safe_load(f)


if __name__ == '__main__':
    if len(sys.argv) == 1:
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(CatMonitService)
        servicemanager.StartServiceCtrlDispatcher()
    else:
        win32serviceutil.HandleCommandLine(CatMonitService)