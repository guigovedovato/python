from core.dao.context import Database
from datetime import datetime
import pymongo 
from bson import ObjectId, json_util
import core.common.utils as utils

class BaseDao:
    def __init__(self):
        base = Database()
        self.db = base.get_base()
        self.coll = None

    def set_coll(self, coll):
        self.coll = coll

    def get_all(self):
        output = []
        for data in self.coll.find():
            output.append(data)
        return json_util.dumps(output)

    def get_by_id(self, entity_id):
        if(utils.is_number(entity_id)):
            return json_util.dumps([])
        return json_util.dumps(self.coll.find_one({'_id': ObjectId(entity_id)}))

    def get_by_filter(self, query):
        return json_util.dumps(self.coll.find(query))

    def update(self, entity_id, entity):
        entity["data_atualizacao"] = str(datetime.now().date())
        entity_updated = self.coll.update({'_id': ObjectId(entity_id)}, {'$set': entity})
        return self.get_by_id(entity_id)

    def insert(self, entity):
        entity["ativo"] = str(True)
        entity["data_cadastro"] = str(datetime.now().date())
        entity_inserted = self.coll.insert_one(entity).inserted_id
        return self.get_by_id(str(entity_inserted))

    def find_fields_by_id(self, entity_id, fields):
        if(utils.is_number(entity_id)):
            return json_util.dumps([])
        return json_util.dumps(self.coll.find_one({'_id': ObjectId(entity_id)}, fields))

    def find_fields(self, fields):
        return json_util.dumps(self.coll.find({"ativo":"True"}, fields))

    def get_by_filter_fields(self, query, fields, order=""):
        request = self.coll.find(query, fields)
        if order != "":
            request.sort(order, pymongo.ASCENDING)
        return json_util.dumps(request)