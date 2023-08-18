const ApiFetchVcu = async (startTime, endTime) => {
    const api_url = V.build_api_url('usage', 'vcu')
    const res = await fetch(`${api_url}/${getSelectedProjectId()}?start_time=${startTime}&end_time=${endTime}`, {
        method: 'GET',
    })
    return res.json();
}

const ApiFetchStorage = async () => {
    const api_url = V.build_api_url('usage', 'storage')
    const res = await fetch(`${api_url}/${getSelectedProjectId()}`, {
        method: 'GET',
    })
    return res.json();
}
const ApiFetchThroughput = async () => {
    const api_url = V.build_api_url('usage', 'throughput')
    const res = await fetch(`${api_url}/${getSelectedProjectId()}`, {
        method: 'GET',
    })
    return res.json();
}

const ApiFetchQuota = async () => {
    const res = await fetch(`/api/v1/projects/quota/${getSelectedProjectId()}`, {
        method: 'GET',
    })
    return res.json();
}
const ApiFetchStorageSpace = async (startTime, endTime) => {
    const api_url = V.build_api_url('usage', 'storage_space')
    const res = await fetch(`${api_url}/${getSelectedProjectId()}?start_time=${startTime}&end_time=${endTime}`, {
        method: 'GET',
    })
    return res.json();
}

const ApiUpdateVCULimit = async (vcuData) => {
    const api_url = V.build_api_url('projects', 'quota')
    const res = await fetch(
        `/api/v1/projects/quota/${getSelectedProjectId()}/?usage_type=vcu`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vcuData)
        })
    return res.json();
}

const ApiUpdateStorageLimit = async (storageData) => {
    const api_url = V.build_api_url('projects', 'quota')
    const res = await fetch(
        `/api/v1/projects/quota/${getSelectedProjectId()}/?usage_type=storage`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(storageData)
        })
    return res.json();
}

const ApiUpdateLimit = async (storageData, type) => {
    const api_url = V.build_api_url('projects', 'quota')
    const res = await fetch(
        `/api/v1/projects/quota/${getSelectedProjectId()}/?usage_type=${type}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(storageData)
        })
    return res.json();
}