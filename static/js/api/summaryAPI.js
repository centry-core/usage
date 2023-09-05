const ApiFetchPrompts = async () => {
    const api_url = V.build_api_url('prompts', 'prompts')
    const res = await fetch(`${api_url}/${getSelectedProjectId()}`, {
        method: 'GET',
    })
    return res.json();
}


const ApiFetchSummary = async (startTime, endTime) => {
    const api_url = V.build_api_url('usage', 'summary')
    const res = await fetch(`${api_url}/${getSelectedProjectId()}?start_time=${startTime}&start_time=${endTime}`, {
        method: 'GET',
    })
    return res.json();
}

const ApiGetPromptField = async (field, rowId) => {
    const api_url = V.build_api_url('usage', 'summary_table_field')
    const res = await fetch(`${api_url}/${getSelectedProjectId()}?id=${rowId}&field=${field}`, {
        method: 'GET',
    })
    return res.json();
}

const ApiFetchPreset = async () => {
    const api_url = V.build_api_url('usage', 'summary_presets')
    const res = await fetch(`${api_url}/${getSelectedProjectId()}`, {
        method: 'GET',
    })
    return res.json();
}

const ApiAddPreset = async (preset) => {
    const api_url = V.build_api_url('usage', 'summary_presets')
    const res = await fetch(`${api_url}/${getSelectedProjectId()}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(preset)

    })
    return res.json();
}

const ApiUpdatePreset = async (preset) => {
    const api_url = V.build_api_url('usage', 'summary_presets')
    const res = await fetch(`${api_url}/${getSelectedProjectId()}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(preset)

    })
    return res.json();
}

const ApiDeletePreset = async (presetName) => {
    const api_url = V.build_api_url('usage', 'summary_presets')
    await fetch(`${api_url}/${getSelectedProjectId()}/${presetName}`, {
        method: 'DELETE',
    })
}