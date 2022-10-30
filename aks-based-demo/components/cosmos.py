from pulumi import ComponentResource, ResourceOptions, Output
from pulumi_azure_native import documentdb

class MongoDbArgs:

    def __init__(self,
                 rg_name=None,
                 location=None,
                 db_name=None,
                 db_collections=None,
                 ):

        self.rg_name = rg_name 
        self.location = location
        self.db_name = db_name
        self.db_collections = db_collections


class MongoDb(ComponentResource):

    def __init__(self,
                 name: str,
                 args: MongoDbArgs,
                 opts: ResourceOptions = None):

        super().__init__('custom:cosmos:MongoDb', name, {}, opts)
        opts.parent = self

        rg_name = args.rg_name
        location = args.location
        db_name = args.db_name
        db_collections = args.db_collections

        #### Cosmos DB MongoDB
        self.database_account = documentdb.DatabaseAccount(f"{name}-cosmos-db-acct", 
            documentdb.DatabaseAccountArgs(
                resource_group_name=rg_name,
                database_account_offer_type=documentdb.DatabaseAccountOfferType.STANDARD,
                kind = documentdb.DatabaseAccountKind.MONGO_DB,
                consistency_policy= documentdb.ConsistencyPolicyArgs(
                    default_consistency_level=documentdb.DefaultConsistencyLevel.BOUNDED_STALENESS,
                    max_interval_in_seconds=10,
                    max_staleness_prefix=200,
                ),
                locations = [documentdb.LocationArgs(
                    failover_priority=0,
                    location_name=location
                )]
            ),
            opts=opts)

        # MongoDB
        db_opts = opts
        db_opts.delete_before_replace = True
        self.database = documentdb.MongoDBResourceMongoDBDatabase(db_name,
            documentdb.MongoDBResourceMongoDBDatabaseArgs(
                resource_group_name=rg_name,
                account_name=self.database_account.name,
                resource=documentdb.MongoDBDatabaseResourceArgs(
                    id=db_name
                )
            ),
            opts=db_opts)

        db_connection_strings = Output.all(rg_name=rg_name, account_name=self.database_account.name).apply(lambda args: documentdb.list_database_account_connection_strings_output(resource_group_name=args["rg_name"], account_name=args["account_name"]))
        self.db_connection_string = db_connection_strings.connection_strings[0].connection_string

        # MongoDB Ports and Ships Collections
        for collection in db_collections:
            mongo_db_resource_mongo_db_collection = documentdb.MongoDBResourceMongoDBCollection(f"{name}-dbcollection-{collection}",
                resource_group_name=rg_name,
                account_name=self.database_account.name,
                collection_name=collection,
                database_name=db_name,
                resource=documentdb.MongoDBCollectionResourceArgs(
                    id=collection
                ),
                opts=db_opts)

        self.register_outputs({})
