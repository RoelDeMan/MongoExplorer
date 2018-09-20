var superagent = require('superagent');
var assert = require('chai').assert

describe("Server", function() {
    this.timeout(10000);
    describe("connect to a database", function () {
        var workingUrl = "http://localhost:3000/localhost/27017/connect";
        var wrongUrl = "http://localhost:3000/hallo/27017/connect";
        var letterPort = "http://localhost:3000/localhost/hello/connect";

        it("should return status 540 when the server can not connect to the database", function (done) {
            superagent
                .get(wrongUrl)
                .send()
                .end((err, response) => {
                    assert.equal(response.statusCode, 540);
                    assert.strictEqual(response.text, 'connectionError');
                    done();
                });
        });
        it("should return status 540 when the port contains letters", function (done) {
            superagent
                .get(letterPort)
                .send()
                .end((err, response) => {
                    assert.equal(response.statusCode, 540);
                    assert.strictEqual(response.text, 'portContainsLetters');
                    done();
            });
        });
        it("returns status 200", function (done) {
            superagent
                .get(workingUrl)
                .send()
                .end((err, response) => {
                    assert.equal(response.statusCode, 200);
                    done();
                });
        });
    });
    describe("Retrieve the requested content of a database", function () {
        var url = "http://localhost:3000/localhost:27017/TestDB/questions/20/1/";

        it("should return the 20 first documents with the underlying data", function (done) {
            superagent
                .post(url+"{}")
                .send()
                .end((err, response) => {
                    content = JSON.parse(response.text);
                    assert.strictEqual(response.statusCode, 200);
                    assert.strictEqual(content.correctFind, true);
                    assert.lengthOf(content.results.documents, 20);
                    done();
                });
        });
        it("should return an error when an incorrect query is given and the regular first 20 documents should also be returned", function (done) {
            superagent
                .post(url+"{incorrectQuery}")
                .send()
                .end((err, response) => {
                    content = JSON.parse(response.text);
                    assert.strictEqual(response.statusCode, 200);
                    assert.strictEqual(content.correctFind, false);
                    assert.lengthOf(content.results.documents, 20);
                    done();
                });
        });
        it("should return the 1 specific document with the underlying data", function (done) {
            superagent
                .post(url+"{nummer: 100}")
                .send()
                .end((err, response) => {
                    content = JSON.parse(response.text);
                    assert.strictEqual(response.statusCode, 200);
                    assert.strictEqual(content.correctFind, true);
                    assert.lengthOf(content.results.documents, 1);
                    assert.strictEqual(content.results.documents[0].nummer, 100);
                    done();
                });
        });
    });
    describe("Delete one from a collection and insert it again", function () {
        var deleteUrl = "http://localhost:3000/localhost:27017/TestDB/questions/20/1/delete";
        var getUrl = "http://localhost:3000/localhost:27017/TestDB/questions/20/1/";
        var importUrl = "http://localhost:3000/localhost:27017/TestDB/questions/import";

        var documentId = "1";
        var documentContent = 1;

        it("should give an error when false id is given", function (done) {
            superagent
                .post(deleteUrl)
                .send({ids: ["2"]})
                .end((err, response) => {
                    content = JSON.parse(response.text);
                    assert.strictEqual(response.statusCode, 200);
                    assert.strictEqual(content.error, 'deleteError')
                    done();

                });
        });
        it("should delete one specific document", function (done) {
            superagent
                .post(deleteUrl)
                .send({ids: [documentId]})
                .end((err, response) => {
                    if(err) done(err);
                    assert.strictEqual(response.statusCode, 200);
                    done();

                });
        });
        it("should find the deleted document with 0 results", function (done) {
            superagent
                .post(getUrl+"{nummer:"+documentContent+"}")
                .send()
                .end((err, response) => {
                    content = JSON.parse(response.text);
                    assert.strictEqual(response.statusCode, 200);
                    assert.strictEqual(content.correctFind, true);
                    assert.lengthOf(content.results.documents, 0);
                    done();

                });
        });
        it('should insert the deleted document in the database', function (done) {
            superagent
                .post(importUrl)
            //{"importData":"[{\"test\": \"test\"}]"}
                .send({importData: [{
                    "_id" : documentId,
                    "nummer" : documentContent,
                    "question" : "1",
                    "answer" : "1 ",
                    "category" : "test",
                    "__v" : 0
                }]})
                .end((err, response) => {
                    assert.strictEqual(response.statusCode, 200);
                    assert.strictEqual(response.text, 'success');
                    done();
                });
        });
        it("should find the imported document with 1 results", function (done) {
            superagent
                .post(getUrl+"{nummer:"+documentContent+"}")
                .send()
                .end((err, response) => {
                    if (err) done(err);
                    content = JSON.parse(response.text);
                    assert.strictEqual(response.statusCode, 200);
                    assert.strictEqual(content.correctFind, true);
                    assert.lengthOf(content.results.documents, 1);
                    done();

                });
        });
    });
    describe("update a document in the collection", function () {
        var updateId = "1";
        var updateUrl = "http://localhost:3000/localhost:27017/TestDB/questions/"+updateId+"/1/20/update";
        var getUrl = "http://localhost:3000/localhost:27017/TestDB/questions/20/1/{_id: \""+updateId+"\"}";

        it("should show the \"nummer\" row from the document as 1", function (done) {
            superagent
                .post(getUrl)
                .send()
                .end((err, response) => {
                    content = JSON.parse(response.text);
                    assert.strictEqual(response.statusCode, 200);
                    assert.strictEqual(content.correctFind, true);
                    assert.lengthOf(content.results.documents, 1);
                    assert.strictEqual(content.results.documents[0].nummer, 1);
                    done();
                });
        });
        it("should update \"nummer\" to 2", function (done) {
            superagent
                .post(updateUrl)
                .send({newData:
                {
                    _id:"1",
                    nummer:2,
                    question: "1",
                    answer: "1 ",
                    category: "test",
                    __v: 0
                }})
                .end((err, response) => {
                    content = JSON.parse(response.text);
                    assert.strictEqual(response.statusCode, 200);
                    assert.isUndefined(content.error);
                    done();
                });
        });
        it("should show the \"nummer\" row from the document as 2", function (done) {
            superagent
                .post(getUrl)
                .send()
                .end((err, response) => {
                    content = JSON.parse(response.text);
                    assert.strictEqual(response.statusCode, 200);
                    assert.strictEqual(content.correctFind, true);
                    assert.lengthOf(content.results.documents, 1);
                    assert.strictEqual(content.results.documents[0].nummer, 2);
                    done();
                });
        });
        it("should give an error and 20 rows from the collection when a incorrect object is given", function (done) {
            superagent
                .post(updateUrl)
                .send({newData:{_id: "slkdjfgdfg"}})
                .end((err, response) => {
                    content = JSON.parse(response.text);
                    assert.strictEqual(response.statusCode, 200);
                    assert.strictEqual(content.error[0], 'updateError');
                    assert.lengthOf(content.data.documents, 20);
                    done();
                });
        });
    });
});