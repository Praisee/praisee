from tornado.concurrent import return_future
from thumbor.loaders import file_loader
from thumbor_cloud_storage.loaders import cloud_storage_loader

# TODO: This should be driven by configuration eventually, instead of hardcoded to loaders

@return_future
def load(context, path, callback):
    def callback_wrapper(result):
        if result:
            callback(result)
        else:
            # Fallback
            file_loader.load(context, path, callback)

    # First attempt to load
    cloud_storage_loader.load(context, path, callback_wrapper)
