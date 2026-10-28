import { Config } from '../config/Config';
import { accountService } from '@/_services';
import { Debug, getSessionProps } from '@/util/Utilities';


export const fetchWrapper = {
    get,
    post,
    put,
    delete: _delete
}

function get(url) {
    if (Debug)
        console.log("get() url is: " + url);
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
                   'Authorization': readSessionCookie(),
                    ...authHeader(url)
                 }
    };
    return fetch(url, requestOptions).then(handleResponse);
}

async function post(url, body) {
    if (Debug)
        console.log("fetch: post() ENTRY url: " + url + " body: " + JSON.stringify(body));
    const token = readSessionCookie();
    if (Debug)
        console.log("fetch: post() token: " + token);
    const requestOptions = 
        {
            method: 'POST',
            headers: 
            { 'Content-Type': 'application/json', 
                    'Authorization': token,
                        ...authHeader(url)
            },
            body: JSON.stringify(body)
        };
    if (Debug)
        console.log("fetch: post() url: " + url);
    if (Debug)
        console.log("fetch: post() options body: " + requestOptions.body);
    let resp = await fetch(url, requestOptions).then(handleResponse);
    if (Debug)
        console.log("fetch: post() url: " + url + " resp: " + typeof data ,resp);
    return resp;
}

function put(url, body) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader(url) },
        body: JSON.stringify(body)
    };
    return fetch(url, requestOptions).then(handleResponse);
}

// prefixed with underscored because delete is a reserved word in javascript
function _delete(url) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(url)
    };
    return fetch(url, requestOptions).then(handleResponse);
}

// helper functions

function authHeader(url) {
    // return auth header with jwt if user is logged in and request is to the api url
    const user = accountService.userValue;
    const isLoggedIn = user && user.jwtToken;
    const isApiUrl = url.startsWith(Config.apiUrl);
    if (isLoggedIn && isApiUrl) {
        return { Authorization: `Bearer ${user.jwtToken}` };
    } else {
        return {};
    }
}


//PDS TEST
// function handleResponse(response) 
// {
//     try 
//     {
//         const text = response.text()
//         var data = text;
//         try
//         {
//             if (Debug)
//             {
//                 console.log("fetch: response[0][json]: " + JSON.stringify(response));
//                 console.log("fetch: response[0][status]: " + response.ok + " " + response.status + " " + response.statusText);
//                 console.log("fetch: response[0][text]: " + text);
//             }
//             if (!response.ok && [400, 401, 502, 503].includes(response.status))
//             {
//                 if (Debug)
//                     console.log("fetch: status not ok: " + response.status);
//                 accountService.logout();
//                 if (Debug)
//                     console.log("fetch: loggedin state: " + accountService.loggedIn);
//             }
//             if (!response.ok && ![200, 201].includes(response.status))
//             {
//                 if (Debug)
//                     console.log("fetch: Got a not ok status: " + response.status);
//                 try 
//                 {
//                     text = JSON.parse(text);
//                     if (Debug)
//                         console.log("fetch: response[dta][text]: " + text);
//                 }
//                 catch (ex) 
//                 {
//                     if (Debug)
//                         console.log("fetch: response[x][text parse exception]: " + ex + " -> " + text);
//                 }
//                 if (text == undefined || text.trim().length == 0)
//                     text = "Invalid request"
//                 if (Debug)
//                     console.log("fetch: EXIT response[error]: [" + text + "]");
//                 return { "status": response.status, "error": response.status + ": " + (text.error != undefined ? text.error : JSON.stringify(text)) };
//             }
//             data = text && JSON.parse(text);
//             if (Debug)
//                 console.log("fetch: response status: " + response.status);
//             // data = response;
//             if (Debug)
//                 console.log("fetch: response[1]: ok? " + response.ok + " data: " + JSON.stringify(data));
//         }
//         catch (ex)
//         {
//             if (Debug)
//                 console.log("fetch: JSON parse error: " + text);
//             return { "status": response.status, "message": response.statusText };
//         }
//         if (!response.ok) 
//         {
//             if ([401, 403].includes(response.status) && accountService.userValue) 
//             {
//                 // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
//                 accountService.logout();
//             }
//             const error = (data && data.message) || response.statusText;
//             return Promise.reject(error);
//         }
//         try
//         {
//             if (Debug)
//               console.log("fetch: response[return]: ok! data: " + JSON.stringify(data));
//         }
//         catch (err)
//         {
//             if (Debug)
//                 console.log("fetch: response[return]: ok! [non-JSON] data: " + data);
//         }
//         return data;
//     }
//     catch (error) 
//     {
//       return Promise.reject(error);
//     }
// }

//PDS TEST SEPT24
async function handleResponse(response) {
    try {
      return await response.text().then(text => {
          var data = text;
          try
          {
            if (Debug)
            {
              console.log("fetch: response[0][json]: ", response);
              console.log("fetch: response[0][status]: " + response.ok + " " + response.status + " " + response.statusText);
              console.log("fetch: response[0][text]: ", text);
            }
              if (!response.ok && [400, 401, 502, 503].includes(response.status))
              {
                if (Debug)
                      console.log("fetch: status not ok: " + response.status);
                  accountService.logout();
                if (Debug)
                  console.log("fetch: loggedin state: " + accountService.loggedIn);
              }
              if (!response.ok && ![200, 201].includes(response.status))
              {
                if (Debug)
                  console.log("fetch: Got a not ok status: " + response.status);
                  try 
                  {
                      data = JSON.parse(text);
                    if (Debug)
                      console.log("fetch: response[dta][text]: " + typeof data, data);
                    if (data?.message)
                        data = JSON.parse(data.message);
                    if (Debug)
                      console.log("fetch: response[dta][text] POST MESSAGE PARSE: " + typeof data, data);
                    if (data?.message)
                    {
                        text = data.message
                        if (Debug)
                          console.log("fetch: response[dta][text] POST MESSAGE 2: " + typeof text, text);
                    }
                    else
                    if (Debug)
                        console.log("fetch: response[dta][text] POST MESSAGE 3: " + typeof text, text);
                  }
                  catch (ex) 
                  {
                    if (Debug)
                      console.log("fetch: response[x][text parse exception]: " + ex + " -> " + text);
                  }
                    data = JSON.parse(text);
                    if (Debug)
                      console.log("fetch: EXIT response[error]: " + typeof data, data);
                    if (data?.message)
                        text = data.message
                  return { "status": response.status, "error": response.status + ": " + (text.error != undefined ? text.error : text) };
              }
              data = text && JSON.parse(text);
            if (Debug)
                  console.log("fetch: response status: " + response.status);
            // data = response;
            if (Debug)
              console.log("fetch: response[1]: ok? " + response.ok + " data: " + typeof data, data);
          }
          catch (ex)
          {
            if (Debug)
            {
              console.log("fetch: JSON parse error exc: ", ex);
              console.log("fetch: JSON parse error: ", text);
            }
              return { "status": response.status, "message": text };
          }
          if (!response.ok) {
              if ([401, 403].includes(response.status) && accountService.userValue) {
                  // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                  accountService.logout();
              }
  
              const error = (data && data.message) || response.statusText;
              return Promise.reject(error);
          }
          try
          {
            if (Debug)
              console.log("fetch: response[return]: ok! data: ", data);
          }
          catch (err)
          {
            if (Debug)
              console.log("fetch: response[return]: ok! [non-JSON] data: ", data);
          }
          if (Debug)
              console.log("fetch: EXIT ", data);
          return data;
      });
    }
    catch (error) {
      return Promise.reject(error);
    }
  }
  
// function handleResponse(response) {
//   try {
//     return response.text().then(text => {
//         var data = text;
//         try
//         {
//             console.log("fetch: response: " + response);
//             console.log("fetch: response[0][json]: " + JSON.stringify(response));
//             console.log("fetch: response[0][status]: " + response.ok + " " + response.status + " " + response.statusText);
//             console.log("fetch: response[0][text]: " + text);
//             try
//             {
//                 if (!response.ok && [400, 401, 502, 503].includes(response.status))
//                 {
//                     console.log("fetch: status not ok: " + response.status);
//                     accountService.logout();
//                     console.log("fetch: loggedin state: " + accountService.loggedIn);
//                 }
//             }
//             catch (ex)
//             {
//                 console.log("fetch: Exception processing reponse: " + ex);
//             }
//             if (!response.ok && ![200, 201].includes(response.status))
//             {
//                 console.log("fetch: Got a not ok status: " + response.status);
//                 try 
//                 {
//                     text = JSON.parse(text);
//                     console.log("fetch: response[dta][text]: " + text);
//                 }
//                 catch (ex) 
//                 {
//                     console.log("fetch: response[x][text parse exception]: " + ex + " -> " + text);
//                 }
//                 if (text == undefined || text.trim().length == 0)
//                     text = "Invalid request"
//                 console.log("fetch: EXIT response[error]: [" + text + "]");
//                 return { "status": response.status, "error": response.status + ": " + (text.error != undefined ? text.error : JSON.stringify(text)) };
//             }
//             try
//             {
//                 console.log("fetch: Attempting to parse JSON @ " + text);
//                 data = text && JSON.parse(text);
//                 if (data == undefined || data == '')
//                 {
//                     data = { status: response.status, message: response.body };
//                 }
//                 console.log("fetch: data parsed to: " + data);
//             }
//             catch (ex)
//             {
//                 console.log("fetch: Unable to parse JSON @ " + text);
//             }
//             console.log("fetch: response status: " + response.status);
//             console.log("fetch: response[1]: ok? " + response.ok + " data: " + data);
//         }
//         catch (ex)
//         {
//             console.log("JSON parse error: " + text);
//             return { "status": response.status, "message": response.statusText };
//         }
//         if (!response.ok) {
//             if ([401, 403].includes(response.status) && accountService.userValue) {
//                 // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
//                 accountService.logout();
//             }

//             const error = (data && data.message) || response.statusText;
//             return Promise.reject(error);
//         }
//         try
//         {
//             console.log("fetch: response[return]: ok! data: " + JSON.stringify(data));
//         }
//         catch (err)
//         {
//             console.log("fetch: response[return]: ok! [non-JSON] data: " + data);
//         }
//         return data;
//     });
//   }
//   catch (error) {
//     return Promise.reject(error);
//   }
// }

function readSessionCookie() {
    //Authenticated session fingerprint
    try
    {
        var sjson = JSON.stringify(getSessionProps());
        if (sjson == null || sjson === 'undefined')
        {
            if (Debug)
                console.log("No-session-fingerprint");
            return null;
        }
        else
        {
            if (Debug)
                console.log("Got-session-json... " + sjson + " => " + JSON.stringify(sjson));
            let json = JSON.parse(sjson);
            if (Debug)
            {
                console.log("session-json-object: " + json);
                console.log("session-json-object-stringed: " + JSON.stringify(json));
                console.log("session-json-token-value: " + json.token);
            }
            var fingerprint = json.token;
            if (Debug)
                console.log("session-fingerprint: " + fingerprint);
            return fingerprint;
        }
    }
    catch (ex)
    {
        if (Debug)
            console.log("exception reading session cookie: " + ex);
    }
    //Traditional session cookie
    const name = "JSESSIONID=";
    let decodedCookie = decodeURIComponent(document.cookie);
    if (Debug)
        console.log(">>> decoded cookies: " + decodedCookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return Date.now() + "";
}