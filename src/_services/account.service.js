import { BehaviorSubject } from 'rxjs';

//import { Config } from '../config/Config';
import { fetchWrapper, history } from '@/_helpers';
import { searchService } from '@/_services/search.service';
import { Debug, getSessionProps } from '../util/Utilities.js';

const userSubject = new BehaviorSubject(null);

var loggedIn = false;

export const accountService = {
    login,
    logout,
    refreshToken,
    getMFArtifacts,
    verifyMFA,
    register,
    resetCreds,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    updateUser,
    deleteUser,
    delete: _delete,
    user: userSubject.asObservable(),
    get userValue () { return userSubject.value }
};

async function login(username, password) 
{
    var loginUrl = sessionStorage.getItem('loginServer');
    var port = '';
    if (window.API_SRV_PORT)
        port = ':' + window.API_SRV_PORT;
    loginUrl = loginUrl + port;
    if (Debug)
        console.log("login() loginURL : " + loginUrl);

    try
    {
        if (Debug)
            console.log("login() ENTRY " + loginUrl)
        var resp = await fetchWrapper.post(`https://${loginUrl}/api/auth/login`, { username, password })
            .then(user => {
                // publish user to subscribers and start timer to refresh token
                userSubject.next(user);
//                startRefreshTokenTimer();
                if (Debug)
                    console.log("login() [then] resp: " + JSON.stringify(resp) + " user: " + JSON.stringify(user))
                return user;
            });
        if (Debug)
            console.log("login() EXIT resp: " + JSON.stringify(resp))
        return resp;
    }
    catch (exc)
    {
        if (Debug)
            console.log("login() EXCEPTION! " + exc.message)
        let msg = exc.message.includes('Failed to fetch') ? "Unable to contact server" : exc.message;
        return { "ok": false, "status": 502, "error": msg, "statusText": msg };
    }
}

function logout() {
//TODO
    // revoke token, stop refresh timer, publish null to user subscribers and redirect to login page
    stopRefreshTokenTimer();
    userSubject.next(null);
}

function refreshToken() {
    return fetchWrapper.post(searchService.getBaseUrl() + `/api/app/refresh-token`, {})
        .then(user => {
            // publish user to subscribers and start timer to refresh token
            userSubject.next(user);
            startRefreshTokenTimer();
            return user;
        });
}

async function getMFArtifacts(username, password)
{
    if (Debug)
        console.log("getMFArtifacts() ENTRY for: " + username);
    let params = {username:username, password:password};
    let resp = await fetchWrapper.post(searchService.getBaseUrl() + `/api/app/mfa-artifacts/`, params);
    if (Debug)
        console.log("getMFArtifacts() artifacts response: " + JSON.stringify(resp));
    if (resp == undefined || resp.status == undefined || resp.qrCode == undefined || resp.secret == undefined)
    {
        let jdata = 
        {
            status: resp != undefined && resp.status != undefined ? resp.status : 400
        }
        return jdata;
    }
    return resp;

//PDS TEST        
    // let jdata = {
    //     status: 200,
    //     qrCode:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQAAAAB0CZXLAAACkklEQVR42u2ZMW6EQAxFjSim5AjchFwMCSQuBjeZI1BSIJz/bTYLSaQ0kcYFFKvV7Ct2vN/2t1f0j0ce4AEe4FdgFJFmxLtVZPvASzpkyDisAwGT6tFMmoC20jWagQ7ZP4gDZByPbVrWQTd896wzbrFJExDYOulFGGqdmykksAtOdgI94x0PoB4ghQp6SEez8z4/BVMYsMzC1+5uL99TrzBgz27p3+qy1ozyzyJWGIBeeWJRRryR/qA0ze9rxgAq1tBqtcyHaKFchl8DAZ5F2UKNaj9kllTU/UshLQ+MkhbdmfToS9SDhRqXGgIBeFDelbF1vcqHhz8SgPRnebKilHTtX9X0Wh+KA5rpQFrv8AtEkWarUV/VPgSA354qZV/CYw6ph0bWOhCAz3hsFwC6t/ZOYegCAfZMepoPXoQ1YHvXqAgAkv6wzKKDq1ijZhQC3GcKBOz87SkAnizUcIXMCgZAtJ2wrzPe0ngNaNO1+5cH2H5cADScZ91vt6uPKg+Yw6yzSVXpO7yvH181KgaAvl5nDJFivsP7JpURCtjY11lI3dUB6Fudb6EuDsB36Mt8qLfMnrwGAiyzarWWDqkKDCent2/pXxhgS7eZkt+9omtnS5K3TYoBeCM6vRz9MZvnbd4sDoznaLHQ0M1QbqL/5EwZCFBG2aq9eREoo/OrxAK4J8qYenZxmzmz7lehgJE2mCfo8H4L+k/pLvNmeeD0cr494FrQthtbLGD0IZxSZTcyf1zn28xbHvCNlphNsgWmSQFeTiMBry2rezkOljDx10IaBTgXmMo9AtcyLQxJHQ3gzsBqAKRwyuO+hi0N+JY1McA+X0hjM2UdCHj9h3K2JHo5uqb5MhSXB54/3R7gAf4b+ATehIKq1lNJ5wAAAABJRU5ErkJggg',
    //     secret:'SDFEUEUE7347Y252GDH38'        
    // }
}

async function verifyMFA(username, mfa, password)
{
    if (Debug)
        console.log("verifyMFA() ENTRY: " + username + " => " + mfa);
    if (mfa != undefined && mfa.length >= 6)
    {
        let params = {username:username, mfa:mfa, password:password};
        if (Debug)
            console.log("verifyMFA() sending verify request...");
        let resp = await fetchWrapper.post(searchService.getBaseUrl() + `/api/app/verify/?mfa=true`, params);
        if (Debug)
            console.log("verifyMFA() verify response: " + JSON.stringify(resp));
        return resp != undefined ? resp.status : 500;
    }
}

async function register(params) 
{
    if (Debug)
        console.log("register: " + searchService.getBaseUrl() + " => " + JSON.stringify(params));
    let resp = await fetchWrapper.post(searchService.getBaseUrl() + `/api/app/register`, params).then((result) => 
    {
        if (Debug)
            console.log("register: EXIT result: " + JSON.stringify(result));
        return result;
    });
    if (Debug)
        console.log("register: EXIT resp: " + JSON.stringify(resp));
    return resp;
}

async function resetCreds(params) 
{
    if (Debug)
        console.log("resetCreds: " + searchService.getBaseUrl() + " => " + JSON.stringify(params));
    let resp = await fetchWrapper.post(searchService.getBaseUrl() + `/api/app/resetcreds/?mfa=true`, params);
    if (Debug)
        console.log("resetCreds: EXIT resp: " + JSON.stringify(resp));
    return resp;
}

function verifyEmail(token) {
    return fetchWrapper.post(searchService.getBaseUrl() + `/api/app/verify-email`, { token });
}

function forgotPassword(email) {
    return fetchWrapper.post(searchService.getBaseUrl() + `/api/auth/fpdstream`, { email });
}

function validateResetToken(token) {
    return fetchWrapper.post(searchService.getBaseUrl() + `/api/app/validate-reset-token`, { token });
}

function resetPassword({ token, password, confirmPassword }) {
    return fetchWrapper.post(searchService.getBaseUrl() + `/api/app/reset-password`, { token, password, confirmPassword });
}

function getAll() {
    return fetchWrapper.get(searchService.getBaseUrl());
}

function getById(id) {
    return fetchWrapper.get(searchService.getBaseUrl() + `/api/app/${id}`);
}

function create(params) {
    return fetchWrapper.post(baseUrl, params);
}

function update(id, params) {
    return fetchWrapper.put(searchService.getBaseUrl() + `/api/app/${id}`, params)
        .then(user => {
            // update stored user if the logged in user updated their own record
            if (user.id === userSubject.value.id) {
                // publish updated user to subscribers
                user = { ...userSubject.value, ...user };
                userSubject.next(user);
            }
            return user;
        });
}

async function updateUser(userData)
{
    const loginUrl = sessionStorage.getItem('loginServer');
    try
    {
        if (Debug)
            console.log("updateUser() ENTRY " + loginUrl)
        var resp = await fetchWrapper.post(`https://${loginUrl}/api/profile/user/?action=modify`, { userData })
            .then(user => {
                if (Debug)
                    console.log("fetch: updateUser() [then] resp: " + resp + " : " + user)
                return {status: 201, data: user};
            });
        if (Debug)
            console.log("fetch: updateUser() EXIT resp: " + resp)
        return resp;
    }
    catch (exc)
    {
        if (Debug)
            console.log("login() EXCEPTION! " + exc.message)
        let msg = exc.message.includes('Failed to fetch') ? "Unable to contact server" : exc.message;
        return { "ok": false, "status": 502, "error": msg, "statusText": msg };
    }
}

async function deleteUser(user) 
{
    if (Debug)
        console.log("deleteUser: " + searchService.getBaseUrl() + " => " + user);
    let url = searchService.getBaseUrl() + `/api/app/account/?action=deleteUser`;
    let payload = {tenantId:getSessionProps().tenantId, id:user};
    if (Debug)
        console.log("deleteUser: url: " + url + " payload: " + JSON.stringify(payload));
    let resp = await fetchWrapper.post(url, payload).then((result) =>
    {
        if (Debug)
            console.log("deleteUser: EXIT [then] resp: " + JSON.stringify(result));
        return result;
    });
    if (Debug)
        console.log("deleteUser: EXIT resp: " + JSON.stringify(resp));
    return resp;
}

// prefixed with underscore because 'delete' is a reserved word in javascript
function _delete(id) {
    return fetchWrapper.delete(searchService.getBaseUrl() + `/api/app/${id}`)
        .then(x => {
            // auto logout if the logged in user deleted their own record
            if (id === userSubject.value.id) {
                logout();
            }
            return x;
        });
}

// helper functions

let refreshTokenTimeout;

function startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    const jwtToken = JSON.parse(atob(userSubject.value.jwtToken.split('.')[1]));

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    refreshTokenTimeout = setTimeout(refreshToken, timeout);
}

function stopRefreshTokenTimer() {
    clearTimeout(refreshTokenTimeout);
}
