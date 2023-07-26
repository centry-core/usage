const Usage = {
    components: {
        'usage-modal-v-c-u': UsageModalVCU
    },
    data() {
        return {
            start_time: null,
            VCU: {
                max: 5000,
                current: 2500,
                limit: 4700,
            },
            STORAGE: {
                max: 50,
                current: 45,
                limit: 25,
            },
            isLoadingVCU: true,
            vcuChart: null,
            storageChart: null,
            vcuLabel: ['01', '02', '03', '04', '05', '06', '07'],
            vcuDatasets: [
                {
                    label: 'VCU 1',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    borderColor: '#29B8F5',
                    tension: 0.1
                },
                {
                    label: 'VCU 2',
                    data: [5, 33, 60, 61, 86, 35, 10],
                    fill: false,
                    borderColor: '#A2ECCD',
                    tension: 0.1
                }
            ],
            storageDatasets: [
                {
                    label: 'STORAGE 1',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    borderColor: '#29B8F5',
                    tension: 0.1
                },
                {
                    label: 'STORAGE 2',
                    data: [5, 33, 60, 61, 86, 35, 10],
                    fill: false,
                    borderColor: '#A2ECCD',
                    tension: 0.1
                },
                {
                    label: 'STORAGE 3',
                    data: [55, 3, 6, 30, 6, 65, 101],
                    fill: false,
                    borderColor: '#FBCFA6',
                    tension: 0.1
                }
            ],
            url: null,
        }
    },
    mounted() {
        this.generateStorageLine(this.VCU);
        this.generateVCULine(this.STORAGE);
        setTimeout(() => {
            this.isLoadingVCU = false;
            window.vcuChart = new Chart(document.getElementById('vcuChart'), {
                type: 'line',
                data: {
                    labels: this.vcuLabel,
                    datasets: this.vcuDatasets,
                },
                options: {
                    plugins: {
                        legend: {
                            display: false,
                        }
                    }
                },
            });
            window.storageChart = new Chart(document.getElementById('storageChart'), {
                type: 'line',
                data: {
                    labels: this.vcuLabel,
                    datasets: this.storageDatasets,
                },
                options: {
                    plugins: {
                        legend: {
                            display: false,
                        }
                    }
                },
            });
        }, 3000)
    },
    methods: {
        generateVCULine(VCU) {
            const systemSize = VCU.current / VCU.max * 100;
            const limitPosition = VCU.limit / VCU.max * 100;
            let bgGradient;
            if (systemSize < VCU.limit) {
                bgGradient = '#139A41'
            } else {
                bgGradient = '#D71616'
            }
            const gradientLine = `linear-gradient(to right, ${bgGradient} ${systemSize}%, #EAEDEF ${100 - systemSize}%)`;
            $('#storageLineVCU').css('background', gradientLine);
            $('#vcu-limit-divider').css('left', `${limitPosition}%`);
            $('#vcu-limit-description').css('left', `${limitPosition}%`);
        },
        generateStorageLine(STORAGE) {
            const systemSize = STORAGE.current / STORAGE.max * 100;
            const limitPosition = STORAGE.limit / STORAGE.max * 100;
            let bgGradient;
            if (systemSize < STORAGE.limit) {
                bgGradient = '#139A41'
            } else {
                bgGradient = '#D71616'
            }
            const gradientLine = `linear-gradient(to right, ${bgGradient} ${systemSize}%, #EAEDEF ${100 - systemSize}%)`;
            $('#storageLine').css('background', gradientLine);
            $('#storage-limit-divider').css('left', `${limitPosition}%`);
            $('#storage-limit-description').css('left', `${limitPosition}%`);
        },
    },
    template: `
        <div class="p-3">
            <div class="card p-28">
                <div class="d-flex justify-content-between">
                    <p class="font-h5 font-bold font-uppercase">Usage report</p>
                    <div class="selectpicker-titled">
                        <span class="font-h6 font-semibold px-3 item__left fa fa-calendar"></span>
                        <select class="selectpicker flex-grow-1" data-style="item__right"
                            v-model="start_time"
                        >
                            <option value="all">All</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last_week">Last Week</option>
                            <option value="last_month">Last Month</option>
                        </select>
                    </div>
                </div>
                <div class="d-grid gap-4 grid-column-4 mt-20">
                    <div class="p-20 usage-card">
                        <div class="blue-square">
                            <img src="/usage/static/assets/icons/wallet.svg">
                        </div>
                        <p class="font-h6 text-uppercase flex-grow-1 text-gray-600 font-semibold">Total payment</p>
                        <p class="font-h3 text-gray-800 font-bold" style="font-size: 32px">205 $</p>
                    </div>
                    <div class="p-20 usage-card">
                        <div class="blue-square">
                            <img src="/usage/static/assets/icons/platform-use.svg">
                        </div>
                        <div class="flex-grow-1">
                            <p class="font-h6 text-uppercase text-gray-600 font-semibold">PLATFORM USE</p>
                            <p class="font-h3 text-uppercase text-gray-800 font-bold">2500 VCU</p>
                        </div>
                        <p class="font-h5 text-gray-800 font-semibold align-self-end  d-flex">
                            <img src="/usage/static/assets/icons/wallet-blue.svg" class="mr-2">180 $
                        </p>
                    </div>
                    <div class="p-20 usage-card">
                        <div class="blue-square">
                            <img src="/usage/static/assets/icons/database.svg">
                        </div>
                        <div class="flex-grow-1">
                            <p class="font-h6 text-uppercase text-gray-600 font-semibold">Platform storage use</p>
                            <p class="font-h3 text-uppercase text-gray-800 font-bold">10 GB</p>
                        </div>
                        <p class="font-h5 text-gray-800 font-semibold align-self-end  d-flex">
                            <img src="/usage/static/assets/icons/wallet-blue.svg" class="mr-2">180 $
                        </p>
                    </div>
                    <div class="p-20 usage-card">
                        <div class="blue-square">
                            <img src="/usage/static/assets/icons/time.svg">
                        </div>
                        <div class="flex-grow-1">
                            <p class="font-h6 text-uppercase text-gray-600 font-semibold">Storage throughput</p>
                            <p class="font-h3 text-uppercase text-gray-800 font-bold">15 GB</p>
                        </div>
                        <p class="font-h5 text-gray-800 font-semibold align-self-end  d-flex">
                            <img src="/usage/static/assets/icons/wallet-blue.svg" class="mr-2">15 $
                        </p>
                    </div>
                </div>
            </div>
            <div class="d-grid gap-4 grid-column-2 mt-3">
                <div class="card p-28">
                    <div class="d-flex justify-content-between">
                        <p class="font-h4 font-bold">Virtual compute units</p>
                        <p class="font-h5 d-flex cursor-pointer"  style="color: #2772E2">
                            <img src="/usage/static/assets/icons/setting-blue.svg" class="mr-2">
                            <span data-toggle="modal" data-target="#exampleModal">
                                limits setting
                            </span>
                        </p>
                    </div>
                    <div class="mt-20">
                        <p class="font-h6 mb-1 text-uppercase text-gray-500 font-semibold">Month platform usage</p>
                        <p class="font-h5 mb-2">{{ VCU.current }} VCU of {{ VCU.max }} VCU</p>
                        <div id="storageLineVCU" class="position-relative" style="height: 8px; border-radius: 4px; display: inline-block; width: 100%">
                            <span id="vcu-limit-description">
                                <img src="/usage/static/assets/icons/flag.svg" class="mr-2">
                                <span class="font-h5 text-gray-600 font-weight-400">{{ VCU.limit}} VCU</span>
                            </span>
                            <span id="vcu-limit-divider"></span>
                        </div>
                    </div>
                    <div class="mt-20 d-flex gap-4">
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">platform use</p>
                            <p class="font-h5">{{ VCU.current }} VCU</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">project use</p>
                            <p class="font-h5">700 VCU</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">hard limit</p>
                            <p class="font-h5">{{ VCU.max }} VCU</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">soft limit</p>
                            <p class="font-h5">{{ VCU.limit }} VCU</p>
                        </div>
                    </div>
                    <div class="mt-20">
                        <div class="position-relative" style="height: 300px">
                            <div class="layout-spinner" v-if="isLoadingVCU">
                                <div class="spinner-centered">
                                    <i class="spinner-loader__32x32"></i>
                                </div>
                            </div>
                            <canvas id="vcuChart"></canvas>
                        </div>
                    </div>
                    
                    <div style="margin-top: 70px">
                        <div class="card-table">
                            <div class="d-flex justify-content-between">
                                <div class="d-flex justify-content-end align-items-center pb-4">
                                    <div>
                                        <ul class="custom-tabs nav nav-pills mr-3" id="pills-tab" role="tablist">
                                            <li class="nav-item" role="presentation">
                                                <a class="active" id="pills-action-tab" data-toggle="pill" href="#pills-action" role="tab" aria-controls="action" aria-selected="true">Usage by action</a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="" id="pills-date-tab" data-toggle="pill" href="#pills-date" role="tab" aria-controls="date" aria-selected="false">Usage by date</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="">
                                <table class="table table-border"
                                       id="ui_summary_table"
                                       :data-url="url"
                                       data-toggle="table"
                                       data-sort-name="loop"
                                       data-sort-order="asc"
                                       data-page-size=10
                                       data-pagination="true"
                                       data-pagination-parts='["pageInfoShort", "pageList"]'>
                                    <thead class="thead-light">
                                    <tr>
                                        <th scope="col" data-sortable="true" data-formatter=trim>Name</th>
                                        <th scope="col" data-sortable="true" data-field="loop">Type</th>
                                        <th scope="col" data-sortable="true" data-field="load_time">Date</th>
                                        <th scope="col" data-sortable="true" data-field="load_time">Platform vcu</th>
                                        <th scope="col" data-sortable="true" data-field="load_time">Project vcu</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card p-28">
                    <div class="d-flex justify-content-between">
                        <p class="font-h4 font-bold">Storage</p>
                        <p class="font-h5 d-flex cursor-pointer"  style="color: #2772E2">
                            <img src="/usage/static/assets/icons/setting-blue.svg" class="mr-2">
                            <span data-toggle="modal" data-target="#exampleModal">
                                limits setting
                            </span>
                        </p>
                    </div>
                    <div class="mt-20">
                        <p class="font-h6 mb-1 text-uppercase text-gray-500 font-semibold">Month platform usage</p>
                        <p class="font-h5 mb-2">{{ STORAGE.current }} GB of {{ STORAGE.max }} GB</p>
                        <div id="storageLine" class="position-relative" style="height: 8px; border-radius: 4px; display: inline-block; width: 100%">
                            <span id="storage-limit-description">
                                <img src="/usage/static/assets/icons/flag.svg" class="mr-2">
                                <span class="font-h5 text-gray-600 font-weight-400">{{ STORAGE.limit}} GB</span>
                            </span>
                            <span id="storage-limit-divider"></span>
                        </div>
                    </div>
                    <div class="mt-20 d-flex gap-4">
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">platform storage</p>
                            <p class="font-h5">{{ STORAGE.current }} GB</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">project storage</p>
                            <p class="font-h5">70 GB</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">throughput</p>
                            <p class="font-h5">{{ STORAGE.max }} GB</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">hard limit</p>
                            <p class="font-h5">{{ STORAGE.limit }} GB</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">soft limit</p>
                            <p class="font-h5">{{ STORAGE.limit }} GB</p>
                        </div>
                    </div>
                    <div class="mt-20">
                        <div class="position-relative" style="height: 300px">
                            <div class="layout-spinner" v-if="isLoadingVCU">
                                <div class="spinner-centered">
                                    <i class="spinner-loader__32x32"></i>
                                </div>
                            </div>
                            <canvas id="storageChart"></canvas>
                        </div>
                    </div>
                    
                    <div style="margin-top: 70px">
                        <div class="card-table">
                            <div class="d-flex justify-content-between">
                                <div class="d-flex justify-content-end align-items-center pb-4">
                                    <div>
                                        <ul class="custom-tabs nav nav-pills mr-3" id="pills-tab" role="tablist">
                                            <li class="nav-item" role="presentation">
                                                <a class="active" id="pills-action-tab" data-toggle="pill" href="#pills-action" role="tab" aria-controls="action" aria-selected="true">Usage by action</a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="" id="pills-date-tab" data-toggle="pill" href="#pills-date" role="tab" aria-controls="date" aria-selected="false">Usage by date</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="">
                                <table class="table table-border"
                                       id="ui_summary_table"
                                       :data-url="url"
                                       data-toggle="table"
                                       data-sort-name="loop"
                                       data-sort-order="asc"
                                       data-page-size=10
                                       data-pagination="true"
                                       data-pagination-parts='["pageInfoShort", "pageList"]'>
                                    <thead class="thead-light">
                                    <tr>
                                        <th scope="col" data-sortable="true" data-formatter=trim>Bucket</th>
                                        <th scope="col" data-sortable="true" data-field="loop">Size</th>
                                        <th scope="col" data-sortable="true" data-field="load_time">Retention</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <usage-modal-v-c-u>
            
            </usage-modal-v-c-u>
        </div>
    `
}

register_component('usage', Usage);