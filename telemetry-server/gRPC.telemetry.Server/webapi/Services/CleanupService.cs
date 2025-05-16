using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using webapi.Models;
using webapi.Monitoring;

namespace gRPC.telemetry.Server.webapi.Services
{
    public class CleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<CleanupService> _logger;

        public CleanupService(IServiceScopeFactory scopeFactory, ILogger<CleanupService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeUntilNextRun(), stoppingToken);

                // update those devices which are active at the moment
                foreach ((Guid deviceID, DateTime lastSeen) in NetworkInfo.Instance.GetAllDevicesUUIDsAndLastSeen())
                {
                    try
                    {
                        DeviceHelper.updateLastSeen(deviceID, lastSeen);
                    }
                    catch (InternalServerError)
                    {
                        // ignore
                    }
                }

                // actually remove those which are unused
                DeviceHelper.RemoveUnusedDevicesAndPermissions();
            }
        }

        private TimeSpan TimeUntilNextRun()
        {
            return TimeSpan.FromSeconds(10);
            var now = DateTime.UtcNow;
            var nextRun = now.Date.AddDays(1);
            return nextRun - now;
        }
    }
}
