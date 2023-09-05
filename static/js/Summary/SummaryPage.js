const SummaryPage = {
    components: {
        SummaryCards,
        SummaryChartLine,
        SummaryChartPie,
        SummaryTable,
    },
    data() {
        return {
            initialStartTime: moment().subtract(1, 'months').format('MM/DD/YYYY'),
            initialEndTime: moment().format('MM/DD/YYYY'),
            startTime: moment().subtract(1, 'months').format('YYYY-MM-DD'),
            endTime: moment().format('YYYY-MM-DD'),
            isLoading: false,
            cardsData: {
                users: 0,
                promptsTotal: 0,
                predictsTotal: 0,
                successfulPredicts: 0,
                embenddings: 0,
            },
            topPromptsDatasets: [],
            topPromptsLabels: [],
            promptsChartLineDatasets: [],
            promptsChartLineLabels: [],
            pieColors: ['#EAF6ED', '#C9EAD4', '#A9DEBA', '#88D1A1', '#67C587', '#59AA76', '#4B8F64', '#3E7553'],
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
        this.fetchData();
        $('input[name="daterange"]').daterangepicker({
            opens: 'left'
        }, (start, end, label) => {
            this.startTime = start.format('YYYY-MM-DD');
            this.endTime = end.format('YYYY-MM-DD');
            this.fetchData();
        });
    },
    methods: {
        fetchData() {
            this.isLoading = true;
            this.$nextTick(async () => {
                const api_url = V.build_api_url('usage', 'summary')
                const res = await fetch(`${api_url}/${getSelectedProjectId()}?start_time=${this.startTime}&end_time=${this.endTime}`, {
                    method: 'GET',
                })
                const data = await res.json();
                this.cardsData = {
                    users: data.users,
                    promptsTotal: data.prompts_total ?? 0,
                    predictsTotal: data.predicts_total,
                    successfulPredicts: data.successful_predicts,
                    embenddings: data.embenddings ?? 0,
                }
                // if (data.predicts_by_date.length === 0) return

                if (window.promptsLineChart?.data) {
                    window.promptsLineChart.destroy();
                    window.promptsLineChart = null;
                }
                this.promptsChartLineDatasets = this.generatePromptsChartLineDatasets(data.predicts_by_date)
                this.promptsChartLineLabels = data.predicts_by_date.map(prompt => prompt.date);

                const backgroundColor = [];
                if (window.promptsPieChart?.data) {
                    window.promptsPieChart.destroy();
                    window.promptsPieChart = null;
                }
                this.topPromptsDatasets = [{
                    data: data.top_promts_by_name.map((prompt, index) => {
                        backgroundColor.push(this.pieColors[index])
                        return prompt.call_count
                    }),
                    backgroundColor: backgroundColor,
                    hoverOffset: 4
                }]
                this.topPromptsLabels = data.top_promts_by_name.map(prompt => prompt.prompt_name);
                this.isLoading = false;
            })
        },
        generatePromptsChartLineDatasets(prompts) {
            return [
                {
                    label: 'response time, ms',
                    data: prompts.map(row => row.response_time),
                    fill: false,
                    borderColor: '#B1C3FA',
                    pointRadius: 2,
                    yAxisID: 'responseTime',
                },
                {
                    label: 'Prompts',
                    data: prompts.map(row => row.predicts),
                    fill: false,
                    borderColor: '#89F4F0',
                    pointRadius: 2,
                    yAxisID: 'prompts',
                }]
        }
    },
    template: `
        <div class="p-3">
            <div class="card p-6">
                <div class="d-flex justify-content-between">
                    <p class="font-h4 font-bold">Summary</p>
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
                <SummaryCards
                    :cardsData="cardsData"
                ></SummaryCards>
            </div>
            <div class="d-grid grid-column-2 gap-3 mt-3">
                <div class="card p-6">
                    <p class="font-h4 font-bold text-gray-700">Prompts</p>
                    <SummaryChartLine
                        :datasets="promptsChartLineDatasets"
                        :labels="promptsChartLineLabels"
                        chartId="promptsChartLine"
                    ></SummaryChartLine>
                </div>
                <div class="card p-6">
                    <p class="font-h4 font-bold text-gray-700">Embeddings</p>
<!--                    <SummaryChartLine-->
<!--                        :datasets="promptsChartLineDatasets"-->
<!--                        :labels="promptsChartLineLabels"-->
<!--                        chartId="EmbendingChartLine"-->
<!--                    ></SummaryChartLine>-->
                </div>
            </div>
            <div class="d-grid grid-column-4 gap-3 mt-3">
                <div class="card p-6">
                    <p class="font-h4 font-bold text-gray-700">Top prompts</p>
                    <SummaryChartPie
                        :datasets="topPromptsDatasets"
                        :labels="topPromptsLabels"
                        chartId="topPromptsChartPie">
                    </SummaryChartPie>
                </div>
                <div class="card p-6">
                    <p class="font-h4 font-bold text-gray-700">Prompts by sentiment</p>
<!--                    <SummaryChartPie-->
<!--                        :datasets="topPromptsDatasets"-->
<!--                        :labels="topPromptsLabels"-->
<!--                        chartId="sentimentPromptsChartPie">-->
<!--                    </SummaryChartPie>-->
                </div>
                <div class="card p-6">
                    <p class="font-h4 font-bold text-gray-700">Top embending</p>
<!--                    <SummaryChartPie-->
<!--                        :datasets="topPromptsDatasets"-->
<!--                        :labels="topPromptsLabels"-->
<!--                        chartId="topEmbendingChartPie">-->
<!--                    </SummaryChartPie>-->
                </div>
                <div class="card p-6">
                    <p class="font-h4 font-bold text-gray-700">Embendings by type</p>
<!--                    <SummaryChartPie-->
<!--                        :datasets="topPromptsDatasets"-->
<!--                        :labels="topPromptsLabels"-->
<!--                        chartId="embendingsTypeChartPie">-->
<!--                    </SummaryChartPie>-->
                </div>
            </div>
            <SummaryTable
                :startTime="startTime"
                :endTime="endTime"
                :key="selectedPeriod"></SummaryTable>
        </div>
    `
}

register_component('SummaryPage', SummaryPage);