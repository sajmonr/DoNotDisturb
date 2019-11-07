using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DoNotDisturb.Services;
using Microsoft.Extensions.DependencyInjection;

namespace DoNotDisturb.Preloaders
{
    public class PreloadService : IPreloader
    {
        private readonly List<IPreload> _preloaders;
        
        public PreloadService(IServiceProvider provider, HeartbeatService heartbeatService)
        {
            var classes = AppDomain.CurrentDomain.GetAssemblies().SelectMany(x => x.GetTypes()).Where(x =>
                x != typeof(PreloadService) && !x.IsInterface && !x.IsAbstract && typeof(IPreload).IsAssignableFrom(x)).ToList();

            _preloaders = classes.Select(type => (IPreload) ActivatorUtilities.CreateInstance(provider, type)).ToList();

            heartbeatService.Beat += Preload;
        }

        public T Get<T>() where T : class, IPreload => _preloaders.FirstOrDefault(p => p.GetType() == typeof(T)) as T;

        public void Preload()
        {
            Parallel.ForEach(_preloaders, new ParallelOptions {MaxDegreeOfParallelism = Environment.ProcessorCount},
                p => p.Preload());
        }
    }
}