const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');
const path = require('path');
const mongoAPI = require(`./DbAPIs/MongoDB`);
const app = express();

var ApiList = {};

/**
 * This will tell the server to listen to port 3000
 */
app.listen(3000);
console.log("The express server runs on localhost:3000");

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json({
    extended: true
}));

/**
 * Middleware wich tells the server who is allowed to communicate.
 */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Cookie');
    next();
});

/**
 * Create a connection with a database.
 *
 * @param host {String}     The host address to connect with.
 * @param port {String}     The port number on the host that should be used.
 *
 * @return {Array}
 */
app.get('/:host/:port/connect', function(req, res){
    if (req.params.port.match(/[a-z]/i)) {
        res.status(540).send('portContainsLetters')
    } else {
        let address = req.params.host + ":" + req.params.port;
        mongoAPI.createConnection(address, function (results, error) {
            if (error !== undefined) {
                res.status(540).send('connectionError')
            }
            else res.send(results)
        });
    }
});

/**
 * Deletes the given documents.
 *
 * @param address {String}      The host and portnumber to connect with.
 * @param databases {String}    The database to delete from.
 * @param collection {String}   The collection to delete from.
 * @param displayDocs {Number}  The amount of docs to return.
 * @param pageValue {Number}    The page to retrieve.
 *
 * @return {Array}
 */
app.post('/:address/:databases/:collection/:displayDocs/:pageValue/delete', function(req, res){
    let address = req.params.address;
    let database = req.params.databases;
    let collection = req.params.collection;
    let ids = req.body.ids;
    let query = req.body.query;
    let displayDocs = req.params.displayDocs;
    let pageValue = req.params.pageValue;

    mongoAPI.delete(address, database, collection, ids, function(results, error){
        if (error === 'connectionError') {
            res.status(200).send({error: 'connectionError'});
        }
        else if(error === 'deleteError') {
            mongoAPI.pagination(address, database, collection, displayDocs, pageValue, "{}", function (content, err) {
                if (err === 'connectionerror') {
                    res.status(200).send({error: 'connectionError'})
                }
                else res.status(200).send({error: 'deleteError', content});
            });
        }
        else {
            mongoAPI.pagination(address, database, collection, displayDocs, pageValue, "{}", function (content, err) {
                if (err === 'connectionerror') {
                    res.status(200).send({error: 'connectionError'})
                }
                else res.status(200).send({error: undefined, content});
            });
        }
    })
});

/**
 * Inserts imported data.
 *
 * @param address {String}      The host and portnumber to connect with.
 * @param databases {String}    The database to delete from.
 * @param collection {String}   The collection to delete from.
 * @param importData {JSON}     The data that should be inserted into the database.
 *
 * @return {Array|String}
 */
app.post('/:address/:databases/:collection/import', function (req, res) {
    let address = req.params.address;
    let database = req.params.databases;
    let collection = req.params.collection;
    let importData = JSON.parse(req.body.importData);
    mongoAPI.import(address, database, collection, importData, function(results, error){
        if (error == 'connectionError') res.send("connectionError");
        else if (error == 'insertError') res.send("insertError");
        else res.send("success");
    })
});

/**
 * Get the information from the database with the given find query.
 *
 * @param address {String}      The host and portnumber to connect with.
 * @param databases {String}    The database to delete from.
 * @param collection {String}   The collection to delete from.
 * @param displayDocs {Number}  The amount of docs to return.
 * @param pageValue {Number}    The page to retrieve.
 * @param query {JSON}          The find query that the database should use when retrieving documents.
 *
 * @return {Object|String}
 */
app.post('/:address/:databases/:collection/:displayDocs/:pageValue/:query', function(req, res){
    let address = req.params.address;
    let database = req.params.databases;
    let collection = req.params.collection;
    let displayDocs= req.params.displayDocs;
    let pageValue = req.params.pageValue;
    let query = req.params.query;

    mongoAPI.pagination(address, database, collection, displayDocs, pageValue, query, function (results, error) {
        if (error == "connectionerror") {
            res.status(540).send('Connection Error/lost')
        }
        else if(error == "queryError") res.send({correctFind: false, results});
        else res.send({correctFind: true, results})
    });
});

/**
 * Updates the specified collection with the given JSON structure
 *
 * @param address {String}      The host and portnumber to connect with.
 * @param databases {String}    The database to delete from.
 * @param collection {String}   The collection to delete from.
 * @param pageSize {Number}     The amount of docs to return.
 * @param page {Number}         The page to retrieve.
 * @param newData {JSON}        The newdata to set in the document.
 *
 * @return {Array|String}
 */
app.post('/:address/:databases/:collection/:_id/:page/:pageSize/update', function (req, res) {
    let address = req.params.address;
    let database = req.params.databases;
    let collection = req.params.collection;
    let _id = req.params._id;
    let page = req.params.page;
    let pageSize = req.params.pageSize;
    let newData = req.body.newData;

    try {
        newData = JSON.parse(newData);
    }
    catch(e) {}
    /**
     * delete id from new data because it can't be updated anyway
     */
    delete newData._id;
    mongoAPI.update(address, database, collection, _id, newData, pageSize, page, function(uResult, uError, errMsg) {
        if(uError === 'connectionError') res.send({error: ["connectionError"]});
        mongoAPI.pagination(address, database, collection, pageSize, page, "{}", function (pResult, pError) {
            if(pError === 'connectionerror') res.send({error: ["connectionError"]});
            else if(uError === 'updateError') res.send({error: ["updateError", errMsg], data: pResult});
            else res.send({data: pResult, error: ['']});
        });
    })
});