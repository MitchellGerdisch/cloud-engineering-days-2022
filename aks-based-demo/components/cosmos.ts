import * as pulumi from "@pulumi/pulumi";
import * as documentdb from "@pulumi/azure-native/documentdb";


export interface MongoDbArgs {
  rgName: string;
  location: string;
  dbName: string;
  dbCollections: string[];
}

export class MongoDb extends pulumi.ComponentResource {
  public readonly dbConnectionString: pulumi.Output<string>;

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
    }, {parent: this, deleteBeforeReplace: true})

    const dbConnectionStrings = pulumi.all([args.rgName, dbAccount.name]).apply(([rgName, dbAccountName]) => documentdb.listDatabaseAccountConnectionStringsOutput({
        resourceGroupName: rgName,
        accountName: dbAccountName,
    }))  

    this.dbConnectionString = dbConnectionStrings[0].connectionString

  }

}
