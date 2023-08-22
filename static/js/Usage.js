const Usage = {
    components: {
        'usage-modal-limits': UsageModalLimits,
        'usage-table': UsageTable,
        'storage-table': StorageTable,
        'table-card': TableCard,
        'usage-chart': UsageChart,
        'usage-filled-line': UsageFilledLine,
        UsageBillingCards,
    },
    data() {
        return {
            initialStartTime: moment().subtract(1, 'months').format('MM/DD/YYYY'),
            initialEndTime: moment().format('MM/DD/YYYY'),
            startTime: moment().subtract(1, 'months').format('YYYY-MM-DD'),
            endTime: moment().format('YYYY-MM-DD'),
            bucketUsageData: null,
            throughputData: null,
            storageSpaceData: null,
            throughputField: null,
            vcuTableByActions: null,
            vcuTableByDate: null,
            storageLimitTotalBlock: false,
            vcuLimitTotalBlock: false,
            noDataVcuChart: true,
            noDataStorageChart: true,
            VCU: {
                platform: null,
                project: null,
                softLimit: null,
                hardLimit: null,
            },
            STORAGE: {
                platform: null,
                platformReadable: null,
                project: null,
                projectReadable: null,
                softLimit: null,
                hardLimit: null,
            },
            isLoadingVCU: true,
            vcuChart: null,
            storageChart: null,
            vcuLabel: [],
            vcuDatasets: [],
            storageLabel: [],
            storageDatasets: [],
            isDataLoaded: false,
            VCU_DOM_REFS: ['#storageLineVCU', '#vcu-limit-divider', '#vcu-limit-description'],
            STORAGE_DOM_REFS: ['#storageLine', '#storage-limit-divider', '#storage-limit-description'],
            EXTREME_FLAG_LEFT_POSITION: 5,
            EXTREME_FLAG_RIGHT_POSITION: 95,
            CORRECTIVE_OFFSET: 6,
            url: null,
        }
    },
    computed: {
        initialDate() {
            return `${this.initialStartTime} - ${this.initialEndTime}`
        },
        selectedPeriod() {
            return `${this.startTime}  |  ${this.endTime}`
        }
    },
    mounted() {
        this.$nextTick(() => {
            Promise.all([
                ApiFetchVcu(this.startTime, this.endTime),
                ApiFetchStorage(),
                ApiFetchQuota(),
                ApiFetchStorageSpace(this.startTime, this.endTime),
            ]).then(res => {
                this.formatterVcu(res[0]);
                this.formatterBucket(res[1]);
                this.formatterQuota(res[2]);
                this.formatterStorageSpace(res[3]);
                this.isDataLoaded = true;
            }).finally(() => {
                this.isLoadingVCU = false;
            })
            $('input[name="daterange"]').daterangepicker({
                opens: 'left'
            }, (start, end, label) => {
                this.startTime = start.format('YYYY-MM-DD');
                this.endTime = end.format('YYYY-MM-DD');
                this.reFetchVCUData();
            });
        })
    },
    methods: {
        formatterVcu(vcuData) {
            this.vcuTableByActions = vcuData.rows;
            this.vcuTableByDate = vcuData.group_by_date;
            this.VCU.platform = vcuData.platform_vcu;
            this.VCU.project = vcuData.project_vcu;
            this.drawCanvasVcu(vcuData);
            $('#vcu_table-actions').bootstrapTable('load', vcuData.rows);
            if (vcuData.group_by_date.length > 0) $('#vcu_table-data').bootstrapTable('load', vcuData.group_by_date);
        },
        formatterBucket(bucketData) {
            this.bucketUsageData = bucketData.rows.map(row => ({ ...row, retention: row.retention?.expiration_measure ?? null}));
            if(bucketData.rows.length > 0) $('#storage_table').bootstrapTable('load', this.bucketUsageData );
            this.STORAGE.platform = bucketData.platform_storage.in_bytes;
            this.STORAGE.project = bucketData.project_storage.in_bytes;
            this.STORAGE.platformReadable = bucketData.platform_storage.readable;
            this.STORAGE.projectReadable = bucketData.project_storage.readable;
        },
        formatterQuota(quotaData) {
            this.VCU.hardLimit = quotaData.vcu_hard_limit;
            this.VCU.softLimit = quotaData.vcu_soft_limit;
            this.STORAGE.softLimit = quotaData.storage_soft_limit;
            this.STORAGE.hardLimit = quotaData.storage_hard_limit;
            this.storageLimitTotalBlock = quotaData.storage_limit_total_block;
            this.vcuLimitTotalBlock = quotaData.vcu_limit_total_block;
        },
        formatterThroughput(throughputData) {
            this.throughputData = throughputData.rows;
            if (this.throughputData.length > 0) {
                $('#throughput_table').bootstrapTable('load', this.throughputData);
            }
        },
        formatterStorageSpace(storageSpaceData) {
            this.storageSpaceData = storageSpaceData;
            this.throughputField = storageSpaceData.total_throughput;
            $('#throughput_table').bootstrapTable('load', storageSpaceData);
            this.drawCanvasStorage(storageSpaceData)
        },
        reFetchVCUData() {
            this.isLoadingVCU = true;
            Promise.all([
                ApiFetchVcu(this.startTime, this.endTime),
                ApiFetchStorageSpace(this.startTime, this.endTime)
            ]).then((res) => {
                this.isLoadingVCU = false;
                const vcuData = res[0];
                this.vcuTableByActions = vcuData.rows;
                this.vcuTableByDate = vcuData.group_by_date;

                $('#vcu_table-actions').bootstrapTable('load', vcuData.rows);
                $('#vcu_table-data').bootstrapTable('load', vcuData.group_by_date);
                this.VCU.platform = vcuData.platform_vcu;
                this.VCU.project = vcuData.project_vcu;
                this.drawCanvasVcu(vcuData);

                const storageSpaceData = res[1];
                this.storageSpaceData = storageSpaceData;
                $('#throughput_table').bootstrapTable('load', storageSpaceData);
                this.drawCanvasStorage(storageSpaceData);
            }).finally(() => {
                this.isLoadingVCU = false;
            })
        },
        drawCanvasVcu(vcuData) {
            if (vcuData.rows.length === 0 ) {
                this.noDataVcuChart = true;
                return
            }
            this.noDataVcuChart = false;
            this.vcuLabel = vcuData.rows.map(row => row.date);
            this.vcuDatasets = generateVcuDatasets(vcuData);
            if (window.vcuChart?.data) {
                window.vcuChart.destroy();
                window.vcuChart = null;
            }
            this.isLoadingVCU = false;
        },
        drawCanvasStorage(storageSpaceData) {
            if (this.storageSpaceData.rows.length === 0) {
                this.noDataStorageChart = true;
                return
            }
            this.noDataStorageChart = false;
            this.storageLabel = storageSpaceData.rows.map(row => row.date);
            this.storageDatasets = generateStorageDatasets(storageSpaceData.rows)
            if (window.storageChart?.data) {
                window.storageChart.destroy();
                window.storageChart = null;
            }
            this.isLoadingVCU = false;
        },
        updateVcuLimits(limits) {
            this.VCU.hardLimit = limits.vcu_hard_limit;
            this.VCU.softLimit = limits.vcu_soft_limit;
            this.vcuLimitTotalBlock = limits.vcu_limit_total_block;
        },
        updateStorageLimits(limits) {
            this.STORAGE.hardLimit = limits.storage_hard_limit;
            this.STORAGE.softLimit = limits.storage_soft_limit;
            this.storageLimitTotalBlock = limits.storage_limit_total_block;
        },
        formatterGb(size) {
            return (size / 1000000000).toFixed(2);
        }
    },
    template: `
        <div class="p-3">
            <div class="card p-28">
                <div class="d-flex justify-content-between">
                    <p class="font-h5 font-bold font-uppercase">Usage report</p>
                    <div class="position-relative d-flex" style="right: -8px">
                        <button class="btn btn-secondary py-0 d-flex align-items-center" style="border-color: #DBE2E8">
                            <span class="pr-2 mr-2 d-flex align-items-center" style="border-right: solid 1px #DBE2E8; height: 32px;">
                                <i class="icon_schedule icon__14x14"></i>
                            </span>
                            <label for="time-picker">
                                <span class="text-gray-800 font-weight-400 cursor-pointer">{{ selectedPeriod }}</span>
                                <i class="icon__14x14 icon-arrow-down__16 ml-2"></i>
                            </label>
                        </button>
                        <input id="time-picker" 
                            type="text"
                            name="daterange" 
                            :value="initialDate"
                            style="visibility: hidden; width: 0px" />
                    </div>
                </div>
                <UsageBillingCards
                    :platformVcu="VCU.platform"
                    :platformStorage="STORAGE.platformReadable" 
                    :throughput="throughputField"
                ></UsageBillingCards>
            </div>
            <div id="table-chart-block" class="d-grid gap-4 grid-column-2 mt-3">
                <div class="card p-28">
                    <div class="d-flex justify-content-between">
                        <p class="font-h4 font-bold">Virtual compute units</p>
                        <p class="font-h5 d-flex cursor-pointer"  style="color: #2772E2">
                            <img src="/usage/static/assets/icons/setting-blue.svg" class="mr-2">
                            <span data-toggle="modal" data-target="#vcuModal">
                                limits setting
                            </span>
                        </p>
                    </div>
                    <div class="mt-20">
                        <p class="font-h6 mb-1 text-uppercase text-gray-500 font-semibold">Month platform usage</p>
                        <p class="font-h5 pb-2">{{ VCU.platform }} VCU <span v-if="VCU.hardLimit > 0">of {{ VCU.hardLimit }} VCU</span></p>
                        <usage-filled-line
                            :limitValues="VCU"
                            :dom-refs="VCU_DOM_REFS"
                            color="#139A41"
                            type="vcu">
                        </usage-filled-line>
                    </div>
                    <div class="mt-20 d-flex gap-4" style="min-height: 60px">
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">platform use</p>
                            <p class="font-h5">{{ VCU.platform }} VCU</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">project use</p>
                            <p class="font-h5">{{ VCU.project }} VCU</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">hard limit</p>
                            <p class="font-h5">{{ VCU.hardLimit }} VCU</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">soft limit</p>
                            <p class="font-h5">{{ VCU.softLimit }} VCU</p>
                        </div>
                    </div>
                    <usage-chart
                        :is-loading="isLoadingVCU"
                        :is-no-data="noDataVcuChart"
                        :labels="vcuLabel"
                        :datasets="vcuDatasets"
                        type="vcu"
                        chartId="vcuChart"
                    >
                    </usage-chart>
                    <usage-table>
                    </usage-table>
                </div>
                <div class="card p-28">
                    <div class="d-flex justify-content-between">
                        <p class="font-h4 font-bold">Storage</p>
                        <p class="font-h5 d-flex cursor-pointer"  style="color: #2772E2">
                            <img src="/usage/static/assets/icons/setting-blue.svg" class="mr-2">
                            <span data-toggle="modal" data-target="#storageModal">
                                limits setting
                            </span>
                        </p>
                    </div>
                    <div class="mt-20">
                        <p class="font-h6 mb-1 text-uppercase text-gray-500 font-semibold">Total storage usage</p>
                        <p class="font-h5 pb-2">{{ STORAGE.platformReadable }} <span v-if="STORAGE.hardLimit > 0">of {{ STORAGE.hardLimit }}GB</span></p>
                        <usage-filled-line
                            :limitValues="STORAGE"
                            :dom-refs="STORAGE_DOM_REFS"
                            color="#2772E2"
                            type="storage">
                        </usage-filled-line>
                    </div>
                    <div class="mt-20 d-flex gap-4" style="min-height: 60px">
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">platform storage</p>
                            <p class="font-h5">{{ STORAGE.platformReadable }}</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">project storage</p>
                            <p class="font-h5">{{ STORAGE.projectReadable  }}</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">throughput</p>
                            <p class="font-h5">{{ throughputField }}</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">hard limit</p>
                            <p class="font-h5">{{ formatterGb(STORAGE.hardLimit) }} GB</p>
                        </div>
                        <div class="mr-4">
                            <p class="font-h6 text-uppercase text-gray-500 font-semibold">soft limit</p>
                            <p class="font-h5">{{ formatterGb(STORAGE.softLimit) }} GB</p>
                        </div>
                    </div>
                    <usage-chart
                        :is-loading="isLoadingVCU"
                        :is-no-data="noDataStorageChart"
                        :labels="storageLabel"
                        :datasets="storageDatasets"
                        type="storage"
                        chartId="storageChart"
                    >
                    </usage-chart>
                    <storage-table>
                    </storage-table>
                </div>
            </div>
            <usage-modal-limits
                v-if="isDataLoaded"
                :hard-limit="VCU.hardLimit"
                :soft-limit="VCU.softLimit"
                :limit-total-block="vcuLimitTotalBlock"
                @update-limits="updateVcuLimits"
                type="vcu"
                >
            </usage-modal-limits>
            <usage-modal-limits
                v-if="isDataLoaded"
                :hard-limit="STORAGE.hardLimit"
                :soft-limit="STORAGE.softLimit"
                :limit-total-block="storageLimitTotalBlock"
                @update-limits="updateStorageLimits"
                type="storage"
                >
            </usage-modal-limits>
        </div>
    `
}

register_component('usage', Usage);