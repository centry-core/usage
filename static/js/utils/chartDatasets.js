const generateVcuDatasets = (vcuData) => {
    return [
        {
            label: 'Platform VCU',
            data: vcuData.rows.map(row => row.platform_vcu),
            fill: false,
            borderColor: '#29B8F5',
            pointRadius: 2,
        },
        {
            label: 'Project VCU',
            data: vcuData.rows.map(row => row.project_vcu),
            fill: false,
            borderColor: '#A2ECCD',
            pointRadius: 2,
        }]
}
const generateStorageDatasets = (storageSpaceData) => {
    return [
        {
            label: 'Throughput',
            data: storageSpaceData.map(row => row.throughput),
            fill: false,
            borderColor: '#29B8F5',
            pointRadius: 2,
            yAxisID: 'throughput',
        },
        {
            label: 'Platform',
            data: storageSpaceData.map(row => row.platform_storage),
            fill: false,
            borderColor: '#A2ECCD',
            pointRadius: 2,
        },
        {
            label: 'Project',
            data: storageSpaceData.map(row => row.project_storage),
            fill: false,
            borderColor: '#d3a2ec',
            pointRadius: 2,
        }]
}