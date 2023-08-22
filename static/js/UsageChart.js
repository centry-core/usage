const UsageChart = {
    props: ['isLoading', 'isNoData', 'chartId', 'type', 'labels', 'datasets'],
    watch: {
        labels: {
            handler: function (newVal, oldVal) {
                if (this.type === 'vcu') {
                    this.generateChartVcu()
                } else {
                    this.generateChartStorage()
                }
            },
            deep: true
        }
    },
    methods: {
        generateChartStorage() {
            this.$nextTick(() => {
                window.storageChart = new Chart(document.getElementById('storageChart'), {
                    type: 'line',
                    data: {
                        labels: this.labels,
                        datasets: this.datasets,
                    },
                    options: {
                        plugins: {
                            legend: {
                                display: false,
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Platform & Project',
                                },
                                ticks: {
                                    callback: (value, index, ticks) => {
                                        return formatBytes(value)
                                    },
                                },
                            },
                            throughput: {
                                beginAtZero: true,
                                position: 'right',
                                display: 'auto',
                                grid: {
                                    drawOnChartArea: false,
                                },
                                title: {
                                    display: true,
                                    text: 'Throughput',
                                },
                                ticks: {
                                    callback: (value, index, ticks) => {
                                        return formatBytes(value)
                                    },
                                },
                            },
                        }
                    }
                });
            })
        },
        generateChartVcu() {
            this.isLoadingVCU = false;
            this.$nextTick(() => {
                window.vcuChart = new Chart(document.getElementById('vcuChart'), {
                    type: 'line',
                    data: {
                        labels: this.labels,
                        datasets: this.datasets,
                    },
                    options: {
                        plugins: {
                            legend: {
                                display: false,
                            }
                        }
                    },
                });
            })
        },
    },
    template: `
        <div class="mt-20">
            <div class="position-relative" style="min-height: 300px;">
                <div class="layout-spinner" v-if="isLoading">
                    <div class="spinner-centered">
                        <i class="spinner-loader__32x32"></i>
                    </div>
                </div>
                <template v-else>
                    <div v-show="isNoData" style="background: #FAFBFD;" class="h-100 rounded-lg">
                        <div class="d-flex justify-content-center align-items-center h-100">
                            <div class="d-flex flex-column align-items-center">
                                <p class="font-h5 text-gray-500 pb-2">No data for this period</p>
                                <img src="/design-system/static/assets/ico/icon_empty-chart.svg">
                            </div>
                        </div>
                    </div>
                    <canvas v-show="!isNoData" :id="chartId"></canvas>
                </template>
            </div>
        </div>
    `
}