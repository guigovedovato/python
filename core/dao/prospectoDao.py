from core.dao.baseDao import BaseDao

class ProspectoDao(BaseDao):
    def __init__(self):
        super().__init__()
        super().set_coll(self.db.prospecto)