using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using gRPC.telemetry.Server.webapi.Monitoring.Network;
using webapi.Monitoring;
using webapi.webapi;

namespace gRPC.telemetry.Server.webapi.Services
{
    public class CleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<CleanupService> _logger;
        private DateTime _lastCleanupDate = DateTime.MinValue;

        public CleanupService(IServiceScopeFactory scopeFactory, ILogger<CleanupService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    try
                    {
                        DeviceHelper.UpsertDevicesDB();
                    } catch (InternalServerError)
                    {
                        Utils.assert(false);
                    }

                    var now = DateTime.UtcNow;

                    if (now.Hour == 1 && now.Date > _lastCleanupDate)
                    {
                        try
                        {
                            DeviceHelper.RemoveUnusedDevices();
                        }catch (InternalServerError)
                        {
                            Utils.assert(false);
                        }
                        _lastCleanupDate = now.Date;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in CleanupService execution");
                }

                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }
}
