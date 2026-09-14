/*jshint esversion: 8 */
/**
 * GiftLink Backend – Test Suite
 * Tests: db connection, gifts API, search API, auth API, comments API, auth middleware
 * Framework: Mocha + Chai + Supertest
 */

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const express = require('express');
const cors = require('cors');

// ─── Build a test app (mirrors app.js but without calling loadData) ──────────
require('dotenv').config();

const connectToDatabase = require('../models/db');
const giftRoutes  = require('../routes/giftRoutes');
const searchRoutes = require('../routes/searchRoutes');
const authRoutes   = require('../routes/authRoutes');
const commentRoutes = require('../routes/commentRoutes');

const testApp = express();
testApp.use('*', cors());
testApp.use(express.json());
testApp.use('/api/gifts',    giftRoutes);
testApp.use('/api/search',   searchRoutes);
testApp.use('/api/auth',     authRoutes);
testApp.use('/api/comments', commentRoutes);

// Shared state across tests
let authToken = '';
let testGiftId = '';
const testEmail = `mocha_test_${Date.now()}@giftlink.test`;
const testPassword = 'TestPass123';
const testName = 'Mocha Tester';

// ─── DB CONNECTION ────────────────────────────────────────────────────────────
describe('Database Connection', () => {
    it('should connect to MongoDB without error', async () => {
        const db = await connectToDatabase();
        expect(db).to.not.be.null;
        expect(db).to.not.be.undefined;
    });
});

// ─── GIFTS API ────────────────────────────────────────────────────────────────
describe('GET /api/gifts', () => {
    it('should return an array of gifts', async () => {
        const res = await request(testApp).get('/api/gifts');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.be.greaterThan(0);
        // save one gift id for later tests
        testGiftId = String(res.body[0]._id || res.body[0].id);
    });

    it('each gift should have required fields', async () => {
        const res = await request(testApp).get('/api/gifts');
        const gift = res.body[0];
        expect(gift).to.have.property('name');
        expect(gift).to.have.property('category');
        expect(gift).to.have.property('condition');
    });
});

describe('GET /api/gifts/:id', () => {
    it('should return a single gift by ID', async () => {
        const allRes = await request(testApp).get('/api/gifts');
        const firstId = String(allRes.body[0]._id);
        const res = await request(testApp).get(`/api/gifts/${firstId}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('name');
    });

    it('should return 404 for a non-existent gift id', async () => {
        const res = await request(testApp).get('/api/gifts/000000000000000000000000');
        expect(res.status).to.equal(404);
    });
});

// ─── SEARCH API ───────────────────────────────────────────────────────────────
describe('GET /api/search', () => {
    it('should return all gifts when no filters are applied', async () => {
        const res = await request(testApp).get('/api/search');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.be.greaterThan(0);
    });

    it('should filter by name (case-insensitive)', async () => {
        const res = await request(testApp).get('/api/search?name=lamp');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        res.body.forEach(g => {
            expect(g.name.toLowerCase()).to.include('lamp');
        });
    });

    it('should filter by condition', async () => {
        const res = await request(testApp).get('/api/search?condition=New');
        expect(res.status).to.equal(200);
        res.body.forEach(g => {
            expect(g.condition.toLowerCase()).to.include('new');
        });
    });

    it('should filter by age_years (lte)', async () => {
        const res = await request(testApp).get('/api/search?age_years=2');
        expect(res.status).to.equal(200);
        res.body.forEach(g => {
            expect(g.age_years).to.be.lte(2);
        });
    });

    it('should return empty array for an impossible filter', async () => {
        const res = await request(testApp).get('/api/search?name=xxxxxnonexistentitemxxx');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(0);
    });
});

// ─── AUTH – REGISTRATION ─────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
    it('should register a new user and return a JWT token', async () => {
        const res = await request(testApp)
            .post('/api/auth/register')
            .send({ name: testName, email: testEmail, password: testPassword });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('authToken');
        expect(res.body).to.have.property('userName', testName);
        expect(res.body).to.have.property('userEmail', testEmail);
        expect(res.body).to.not.have.property('password');
        authToken = res.body.authToken;
    });

    it('should reject registration with a duplicate email', async () => {
        const res = await request(testApp)
            .post('/api/auth/register')
            .send({ name: testName, email: testEmail, password: testPassword });
        expect(res.status).to.equal(409);
        expect(res.body).to.have.property('error');
    });

    it('should reject registration with missing fields', async () => {
        const res = await request(testApp)
            .post('/api/auth/register')
            .send({ email: 'missing@giftlink.test' });
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error');
    });
});

// ─── AUTH – LOGIN ─────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
    it('should login with valid credentials and return a JWT', async () => {
        const res = await request(testApp)
            .post('/api/auth/login')
            .send({ email: testEmail, password: testPassword });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('authToken');
        expect(res.body).to.have.property('userName', testName);
        expect(res.body).to.not.have.property('password');
        authToken = res.body.authToken; // refresh token
    });

    it('should reject login with wrong password', async () => {
        const res = await request(testApp)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'wrongpassword' });
        expect(res.status).to.equal(401);
    });

    it('should reject login with non-existent email', async () => {
        const res = await request(testApp)
            .post('/api/auth/login')
            .send({ email: 'nobody@giftlink.test', password: 'whatever' });
        expect(res.status).to.equal(401);
    });

    it('should reject login with missing fields', async () => {
        const res = await request(testApp)
            .post('/api/auth/login')
            .send({ email: testEmail });
        expect(res.status).to.equal(400);
    });
});

// ─── AUTH – PROFILE ───────────────────────────────────────────────────────────
describe('GET /api/auth/profile', () => {
    it('should return the user profile with a valid token', async () => {
        const res = await request(testApp)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('email', testEmail);
        expect(res.body).to.not.have.property('password');
    });

    it('should reject profile request without a token', async () => {
        const res = await request(testApp).get('/api/auth/profile');
        expect(res.status).to.equal(401);
    });

    it('should reject profile request with an invalid token', async () => {
        const res = await request(testApp)
            .get('/api/auth/profile')
            .set('Authorization', 'Bearer invalidtoken123');
        expect(res.status).to.equal(403);
    });
});

// ─── AUTH – UPDATE PROFILE ────────────────────────────────────────────────────
describe('PUT /api/auth/update', () => {
    it('should update the user name with a valid token', async () => {
        const newName = 'Mocha Updated';
        const res = await request(testApp)
            .put('/api/auth/update')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: newName });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('name', newName);
    });

    it('should reject update without a token', async () => {
        const res = await request(testApp)
            .put('/api/auth/update')
            .send({ name: 'Hacker' });
        expect(res.status).to.equal(401);
    });

    it('should reject update when name is missing', async () => {
        const res = await request(testApp)
            .put('/api/auth/update')
            .set('Authorization', `Bearer ${authToken}`)
            .send({});
        expect(res.status).to.equal(400);
    });
});

// ─── COMMENTS API ─────────────────────────────────────────────────────────────
describe('GET /api/comments/:giftId', () => {
    it('should return an array of comments (may be empty)', async () => {
        const giftsRes = await request(testApp).get('/api/gifts');
        const giftId = String(giftsRes.body[0]._id);
        const res = await request(testApp).get(`/api/comments/${giftId}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });
});

describe('POST /api/comments/:giftId', () => {
    it('should add a comment with sentiment when authenticated', async () => {
        const giftsRes = await request(testApp).get('/api/gifts');
        const giftId = String(giftsRes.body[0]._id);

        const res = await request(testApp)
            .post(`/api/comments/${giftId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ comment: 'This is a wonderful item, I love it!' });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('comment');
        expect(res.body).to.have.property('author');
        expect(res.body).to.have.property('sentiment');
        expect(res.body).to.have.property('createdAt');
    });

    it('should reject a comment without authentication', async () => {
        const giftsRes = await request(testApp).get('/api/gifts');
        const giftId = String(giftsRes.body[0]._id);

        const res = await request(testApp)
            .post(`/api/comments/${giftId}`)
            .send({ comment: 'Unauthenticated comment attempt' });

        expect(res.status).to.equal(401);
    });

    it('should reject an empty comment', async () => {
        const giftsRes = await request(testApp).get('/api/gifts');
        const giftId = String(giftsRes.body[0]._id);

        const res = await request(testApp)
            .post(`/api/comments/${giftId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ comment: '   ' });

        expect(res.status).to.equal(400);
    });
});
