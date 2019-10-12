namespace DoNotDisturb.Preloaders
{
    public interface IPreloader : IPreload
    {
        T Get<T>() where T : class, IPreload;
    }
}