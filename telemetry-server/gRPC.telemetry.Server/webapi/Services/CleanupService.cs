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

                // TODO: deletion logic
                foreach (Guid deviceID in NetworkInfo.Instance.GetAllDevicesUUIDs())
                {
                    DeviceHelper.updateLastSeen(deviceID);
                }
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
