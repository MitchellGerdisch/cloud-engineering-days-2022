import * as pulumi from "@pulumi/pulumi";
import * as documentdb from "@pulumi/azure-native/documentdb";


export interface MongoDbArgs {
  rgName: pulumi.Output<string>;
  location: pulumi.Output<string>;
  dbName: string;
  dbCollections: string[];
}

export class MongoDb extends pulumi.ComponentResource {
  public readonly dbConnectionString: pulumi.Output<string> | undefined; 

  constructor(name: string, args: MongoDbArgs, opts?: pulumi.ComponentResourceOptions) {

    super("custom:resource:MongoDb", name, args, opts);

    const dbAccount = new documentdb.DatabaseAccount(`${name}-cosmos-db-acct`, {
        resourceGroupName: args.rgName,
        databaseAccountOfferType: documentdb.DatabaseAccountOfferType.Standard,
        kind: documentdb.DatabaseAccountKind.MongoDB,
        consistencyPolicy: {
            defaultConsistencyLevel: documentdb.DefaultConsistencyLevel.BoundedStaleness,
            maxIntervalInSeconds: 10,
            maxStalenessPrefix: 200,
        },
        locations: [{
            failoverPriority: 0,
            locationName: args.location,
        }]
    }, {parent: this});

    const database = new documentdb.MongoDBResourceMongoDBDatabase(args.dbName, {
        resourceGroupName: args.rgName,
        accountName: dbAccount.name,
        resource: {
            id: args.dbName
        }
    }, {parent: this, deleteBeforeReplace: true});

    for (let collection of args.dbCollections) {
      const mongoDbCollection  = new documentdb.MongoDBResourceMongoDBCollection(`${name}-dbcollection-${collection}`, {
        resourceGroupName: args.rgName,
        accountName: dbAccount.name,
        collectionName: collection,
        databaseName: args.dbName,
        resource: {
          id: collection
        },
      }, {parent: this})
    }

    const connectionStrings = pulumi.all([args.rgName, dbAccount.name]).apply(([rgName, dbName]) => 
      documentdb.listDatabaseAccountConnectionStrings({
        resourceGroupName: rgName,
        accountName: dbName,
    }))

    this.dbConnectionString = connectionStrings.connectionStrings?.apply(array => {
        let retval
        if (array) {
            retval = array[0].connectionString
        } else {
            retval = "goo"
        }
        return pulumi.secret(retval)
    })
  }
}
