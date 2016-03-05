var expect = require('chai').expect;
var request = require('supertest');
var app = require('../server');

describe('GET /', function(){
    it('responds with success', function(done){
        request(app)
            .get('/')
            .expect(200, done);
    });
});

describe('undefined routes', function(){
    it('respond with a 404', function(done){
        request(app)
            .get('/not-real')
            .expect(404, done);
    });
});