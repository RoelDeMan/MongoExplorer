//=====================================================================
//    Initialization
//---------------------------------------------------------------------

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mObjectId = require('mongoose').Types.ObjectId;
const assert = require('assert');
const http = require('http');
const path = require('path');

//=====================================================================
//    Functions
//---------------------------------------------------------------------

/**
 * returns a new string if given string is a legitimate ObjectID.
 *
 * @param string {String} the string to check.
 *
 * @returns {Boolean}
 */
let checkObjectId = (string) => {
    if(mObjectId.isValid(string)) {
        let stringObj = new mObjectId(string);
        return (stringObj == string)
    } else {
        return false;
    }
};


module.exports = {
 /**
  * Tests a connection with a database
  *
  * @param address {String}    The host and portnumber to connect with.
  * @param cb {Function}       The Function to call when finished.
  * @param obj {Object}        The Object to store data in.
  */
  createConnection:
    function createConnection(address, cb, obj={}){
      function connect(){
          return new Promise(function(resolve, reject){
              MongoClient.connect('mongodb://'+address+'/', function(err, db) {
                  if(err) reject(err);
                  else {
                      obj[address] = {databases: {}};
                      resolve(db.admin());
                  }
              });
          });
      }
      function databases(admin){
          return new Promise(function(resolve, reject){
              admin.listDatabases(function (err, dbs) {
                  if(err) reject(err);
                  else {
                      resolve(dbs);
                  }
              });
          });
      }
      function collections(dbs){
          return new Promise(function(resolve, reject){
              let j =0;
              for(let i=0;i<dbs.databases.length;i++) {
                  obj[address].databases[dbs.databases[i].name] = {};
                  MongoClient.connect('mongodb://' + address + '/' + dbs.databases[i].name, function (err, db) {
                      if (err) reject(err);
                      else {
                          db.listCollections().toArray(function (err, collections) {
                              if(err) {
                                  reject(err);
                                  db.close();
                              }
                              else {
                                  obj[address].databases[dbs.databases[i].name].collections = collections;
                                  db.close();
                                  j++;
                                  if ((j) == dbs.databases.length) {
                                      resolve(obj);
                                  }
                              }
                          });
                      }
                  });
              }
          });
      }
      connect(address).then(
          function(admin) {databases(admin).then(
              function(dbs){collections(dbs).then(
                  function(obj){
                      cb(obj)
              }).catch(function(err) {
                cb('',err)
              });
          }).catch(function(err) {
            cb('',err)
          });
      }).catch(function(err) {
        cb('',err)
      });
    },

    /**
     * Get a number of documents from a database on a certain page
     *
     * @param address {String}          The host and portnumber to connect with.
     * @param database {String}         The database to delete from.
     * @param collection {String}       The collection to delete from.
     * @param displayDocs {Number}      The amount of docs to return.
     * @param pageValue {Number}        The page to retrieve.
     * @param query {Object}            The query to use when finding documents
     * @param cb {Function}             The Function to call when finished.
     * @param countAndresults {Object}  The object to store the results in.
     */
    pagination:
        function pagination(address, database, collection, displayDocs, pageValue, query, cb, countAndresults={}){
            function setResults(err, documents, cb, db, count, error) {
                if (err) cb('',"connectionerror");
                else {

                    countAndresults[collectionCount] = count;
                    documents.forEach((document, index)=>{
                        if(checkObjectId(document._id)) documents[index]._id = `ObjectID(${document._id})`;
                    });
                    countAndresults[resultDocuments] = documents;
                    cb(countAndresults, error);
                    db.close();
                }
            }
            let error;
            if(query.includes('ObjectId(')){
                query = eval("(" + query.split('ObjectId(')[0] + query.split('ObjectId(')[1].split(')')[0] + query.split(')')[1] + ")");
                query._id = ObjectID(query._id);
            } else {
                try {
                    try {
                        query = JSON.parse(query);
                    } catch(e) {
                        if(typeof eval("("+query+")") == "object") query = eval("("+query+")");
                        else throw('error');
                    }
                } catch(err) {
                    error = 'queryError';
                    query = {};
                }
            }
            let collectionCount = 'totalDocs';
            let resultDocuments = 'documents';
            MongoClient.connect('mongodb://' + address + '/' + database, function (err, db) {
                if (err) cb('',"connectionerror");
                else {
                    db.collection(collection).find(query).count(function (err, count) {
                        if(err) {
                            cb('',"connectionerror");
                            db.close();
                        }
                        else {
                            if(pageValue > 1) {
                                let skipDocs = pageValue * displayDocs - displayDocs;
                                db.collection(collection).find(query).skip(skipDocs).limit(Number(displayDocs)).toArray((err, documents) => setResults(err, documents, cb, db, count, error));
                            } else db.collection(collection).find(query).limit(Number(displayDocs)).toArray((err, documents) => setResults(err, documents, cb, db, count, error));
                        }
                    });
                }
            });
        },

    /**
     * Delete a number of documents from the database.
     *
     * @param address {String}      The host and portnumber to connect with.
     * @param database {String}     The database to delete from.
     * @param collection {String}   The collection to delete from.
     * @param ids {Array}           An Array of documentID's to be deleted.
     * @param cb {Function}         The Function to call when finished.
     */
    delete:
        function deleteDocuments(address, database, collection, ids, cb) {
            function findAndDelete(id, collection, db) {
                return new Promise((resolve)=>{
                    db.collection(collection).findOneAndDelete({_id: id}, function (err, res) {
                        if (err) cb('', 'deleteError');
                        else if(res.lastErrorObject.n == 0){
                            cb('', 'deleteError')
                        }
                        else {
                            resolve();
                        }
                    })
                });
            }
            MongoClient.connect('mongodb://' + address + '/' + database, function (error, db) {
                if (error) cb('', 'connectionError');
                else {
                    ids.forEach((id, index) => {
                        if(typeof id === "number") {
                            findAndDelete(Number(id), collection, db).then(()=> {
                                if(index+1 == ids.length) cb('deleted')});
                        }
                        else if(checkObjectId(id)) {
                            findAndDelete(ObjectID(id), collection, db).then(()=> {
                                if(index+1 == ids.length) cb('deleted')});
                        }
                        else {
                            findAndDelete(id, collection, db).then(()=> {
                                if(index+1 == ids.length) cb('deleted')});
                        }
                    });
                }

                db.close();
            });
        },

    /**
     * Insert a number of documents into the database.
     *
     * @param address {String}      The host and portnumber to connect with.
     * @param database {String}     The database to delete from.
     * @param collection {String}   The collection to delete from.
     * @param data {Array}          An Array of documents that should be inserted into the database.
     * @param cb {Function}         The Function to call when finished.
     */
    import:
        function importData(address, database, collection, data, cb){
            MongoClient.connect('mongodb://' + address + '/' + database, function (error, db) {
                if (error) {
                    cb('', 'connectionError');
                    db.close();
                }
                else {
                    try {
                        data.forEach((document, index)=>{
                            if(checkObjectId(document._id)) data[index]._id = ObjectID(document._id);
                        });
                        db.collection(collection).insertMany(data, function (err, res) {
                            if (err) cb('', 'insertError');
                            else {
                                cb(res);
                            }
                            db.close();
                        })
                    } catch (error) {
                        cb('', 'insertError');
                        db.close();
                    }
                }
            });
        },

    /**
     * Update a single document in the database.
     *
     * @param address
     * @param database
     * @param collection
     * @param _id
     * @param data
     * @param displayDocs
     * @param pageValue
     * @param cb
     */
    update:
        function importData(address, database, collection, _id, data, displayDocs, pageValue, cb){
            function findAndUpdate(id, collection, db) {
                return new Promise((resolve, reject)=>{
                    db.collection(collection).update({_id: id}, data, function (err, res) {
                        if (err) {
                            cb('', 'updateError', err);
                            db.close();
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
                });
            }
            MongoClient.connect('mongodb://' + address + '/' + database, function (error, db) {
                if (error) cb('', 'connectionError');
                else {
                    if(typeof _id === "number") {
                        findAndUpdate(Number(_id), collection, db).then(()=> {
                            cb('deleted');
                            db.close();
                        });
                    }
                    else if(checkObjectId(_id)) {
                        findAndUpdate(ObjectID(_id), collection, db).then(()=> {
                            cb('deleted');
                            db.close();
                        });
                    }
                    else {
                        findAndUpdate(_id, collection, db).then(()=> {
                            cb('deleted');
                            db.close();
                        });
                    }
                }
            });
        }
};