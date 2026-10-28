import { fetchWrapper } from '@/_helpers';
import { getBaseUrl } from '@/_services';

export const incidentService = {
    getStats,
    getCounter,
    getIncidents,
    create,
    update,
    delete: _delete
};

function getStats(timeRange = 0, rows = 0, user = 'admin', gap = '1DAYS') {
    return fetchWrapper.get(getBaseUrl() + `/api/app/incidents/stats?fromTime=${timeRange}&datefacets=true&gap=${gap}&rows=${rows}&user={user}`);
}

function getCounter(id) {
    return fetchWrapper.get(getBaseUrl() + `/api/app/incidents/${id}`);
}

function getIncidents(params) {
    return fetchWrapper.get(getBaseUrl() + `/api/app/incidents/${params}`);
}

function create(params) {
    return fetchWrapper.post(getBaseUrl() + `/api/app/incidents/`, params);
}

function update(id, params) {
    return fetchWrapper.put(getBaseUrl() + `/api/app/incidents/${id}`, params);
}

// prefixed with underscored because delete is a reserved word in javascript
function _delete(id) {
    return fetchWrapper.delete(getBaseUrl() + `/api/app/incidents/${id}`);
}
