from tools import db


def init_db():
    from .models.usage_vcu import UsageVCU
    from .models.usage_storage import UsageStorage
    from .models.usage_api import UsageAPI
    db.get_shared_metadata().create_all(bind=db.engine)

