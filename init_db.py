from tools import db


def init_db():
    from .models.resource_usage import ResourceUsage
    from .models.storage_used_space import StorageUsedSpace
    db.get_shared_metadata().create_all(bind=db.engine)

