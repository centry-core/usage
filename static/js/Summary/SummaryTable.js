const SummaryTable = {
    props: ['startTime', 'endTime'],
    components: {
        modalSavePreset,
    },
    data() {
        return {
            loadingTable: false,
            selectedPreset: {
                name: 'default'
            },
            allFields: [
                "project_id",
                "user",
                "roles",
                "date",
                "prompt_id",
                "prompt_name",
                "prompt_type",
                "version",
                "integration_uid",
                "model_name",
                "temperature",
                "max_decode_steps",
                "max_tokens",
                "examples",
                "context",
                "variables",
                "top_p",
                "top_k",
                "input",
                "response",
                "run_time",
                "status_code",
            ],
            defaultPreset: {
                "name": "default",
                "fields": [
                    "user",
                    "date",
                    "input",
                    "response",
                ]
            },
            allPresets: [],
            defaultPresetsTableData: [
                {
                    title: "project id",
                    field: "project_id",
                    checked: false,
                },
                {
                    title: "user",
                    field: "user",
                    checked: true,
                },
                {
                    title: "roles",
                    field: "roles",
                    checked: false,
                },
                {
                    title: "date",
                    field: "date",
                    checked: true,
                },
                {
                    title: "prompt id",
                    field: "prompt_id",
                    checked: false,
                },
                {
                    title: "prompt name",
                    field: "prompt_name",
                    checked: false,
                },
                {
                    title: "prompt type",
                    field: "prompt_type",
                    checked: false,
                },
                {
                    title: "version",
                    field: "version",
                    checked: false,
                },
                {
                    title: "integration id",
                    field: "integration_uid",
                    checked: false,
                },
                {
                    title: "model name",
                    field: "model_name",
                    checked: false,
                },
                {
                    title: "temperature",
                    field: "temperature",
                    checked: false,
                },
                {
                    title: "max tokens",
                    field: "max_tokens",
                    checked: false,
                },
                {
                    title: "context",
                    field: "context",
                    checked: false,
                },
                {
                    title: "max decode steps",
                    field: "max_decode_steps",
                    checked: false,
                },
                {
                    title: "top p",
                    field: "top_p",
                    checked: false,
                },
                {
                    title: "top k",
                    field: "top_k",
                    checked: false,
                },
                {
                    title: "input",
                    field: "input",
                    checked: true,
                },
                {
                    title: "output",
                    field: "response",
                    checked: true,
                },
                {
                    title: "examples",
                    field: "examples",
                    checked: false,
                },
                {
                    title: "variables",
                    field: "variables",
                    checked: false,
                },
                {
                    title: "run time",
                    field: "run_time",
                    checked: false,
                },
                {
                    title: "status",
                    field: "status_code",
                    checked: false,
                }
            ],
            customPresetsTableData: [],
            showModal: false,
            loadingSaveAs: false,
            loadingDelete: false,
            loadingUpdate: false,
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.fetchAllPresets().then((data) => {
                this.allPresets = [ this.defaultPreset, ...data ];
            });
            this.initPromptsTable();
            this.customPresetsTableData = _.cloneDeep(this.defaultPresetsTableData)
        })
        $(".dropdown-menu.close-outside").on("click", function (event) {
            event.stopPropagation();
        });
        $('#tablePrompt').on('expand-row.bs.table', function (e, index, row, $detail) {
            $detail.html('Loading...');
            const tableArea = ['<div>'];
            ApiGetPromptField(row.id).then((data) => {
                for (const key in data) {
                    if (key === 'examples') {
                        const textfields = [];
                        data[key].forEach(row => {
                            delete row["id"]
                            delete row["prompt_id"]
                            delete row["created_at"]
                            delete row["is_active"]
                            textfields.push(`
                                <div class="d-flex gap-3">${JSON.stringify(row, null, 4)}</div>
                            `)
                        })
                        tableArea.push('<div class="d-flex mb-3"><div class="d-inline-block font-bold flex-shrink-0 text-gray-800 font-h5" style="width: 125px">' + key + ':</div><div>' + textfields.join('') + '</div></div>')
                    } else if (key === 'variables') {
                        tableArea.push('<div class="d-flex mb-3"><div class="d-inline-block font-bold flex-shrink-0 text-gray-800 font-h5" style="width: 125px">' + key + ':</div><div>' + JSON.stringify(data[key], null, 4) + '</div></div>')
                    } else if (key === 'response') {
                        const field = 'output';
                        const textfields = [];
                        data[key]['messages'].forEach(row => {
                            textfields.push(`
                                <div class="d-flex gap-3">${row["content"]}</div>
                            `)
                        })
                        tableArea.push('<div class="d-flex mb-3"><div class="d-inline-block font-bold flex-shrink-0 text-gray-800 font-h5" style="width: 125px">' + field + ':</div><div>' + textfields.join('') + '</div></div>')
                    } else {
                        const field = key.split('_').join(' ');
                        tableArea.push('<div class="d-flex mb-2"><div class="d-inline-block font-bold flex-shrink-0 text-gray-800 font-h5" style="width: 125px">' + field + ':</div><div>' + data[key] + '</div></div>')
                    }
                }
            }).finally(() => {
                tableArea.push('</div>');
                tableArea.join('');
                $detail.html(tableArea);
            })
        });
    },
    methods: {
        async fetchAllPresets () {
            const api_url = V.build_api_url('usage', 'summary_presets')
            const res = await fetch(`${api_url}/${getSelectedProjectId()}`, {
                method: 'GET',
            })
            return res.json();
        },
        updatePreset(presetName) {
            const newPreset = {
                "name": presetName,
                "fields": this.customPresetsTableData.filter(field => field.checked).map(f => f.field)
            }
            this.loadingUpdate = true;
            ApiUpdatePreset(newPreset).then(() => {
                this.selectPreset(newPreset);
            }).then(() => {
                this.fetchAllPresets().then((data) => {
                    this.allPresets = [ this.defaultPreset, ...data ];
                    this.fillPresetTable();
                })
            }).finally(() => {
                this.loadingUpdate = false;
            })
        },
        savePresetAs(presetName) {
            const newPreset = {
                "name": presetName,
                "fields": this.customPresetsTableData.filter(field => field.checked).map(f => f.field)
            }
            this.loadingSaveAs = true;
            ApiAddPreset(newPreset).then(() => {
                this.selectPreset(newPreset);
            }).then(() => {
                this.fetchAllPresets().then((data) => {
                    this.allPresets = [ this.defaultPreset, ...data ];
                })
            }).finally(() => {
                this.showModal = false;
                this.loadingSaveAs = false;
            })
        },
        deletePreset(presetName) {
            this.loadingDelete = true;
            ApiDeletePreset(presetName).then(() => {
                this.loadingDelete = false;
                this.allPresets = this.allPresets.filter(preset => preset.name !== presetName);
                if (this.selectedPreset.name === presetName) {
                    this.selectPreset(this.defaultPreset);
                }
            })
        },
        selectPreset(selectedPreset) {
            this.selectedPreset = selectedPreset;
            this.allFields.forEach(field => {
                if (this.selectedPreset.fields.includes(field)) {
                    $('#tablePrompt').bootstrapTable('showColumn', field);
                } else {
                    $('#tablePrompt').bootstrapTable('hideColumn', field);
                }
            })
            this.fillPresetTable();
        },
        fillPresetTable() {
            if (this.selectedPreset.name === 'default') {
                this.customPresetsTableData = _.cloneDeep(this.defaultPresetsTableData)
                return
            }
            this.customPresetsTableData = _.cloneDeep(this.defaultPresetsTableData.map(value => {
                if (this.selectedPreset.fields.includes(value.field)) {
                    return {
                        ...value,
                        checked: true,
                    }
                } else {
                    return {
                        ...value,
                        checked: false,
                    }
                }
            }))
        },
        initPromptsTable() {
            const tableOptions = {
                pagination: true,
                url: `/api/v1/usage/summary_table/default/${getSelectedProjectId()}?start_time=${this.startTime}&end_time=${this.endTime}`,
                queryParamsType: '',
                queryParams: function(params) {
                    return {
                        limit: params.pageSize,
                        sort: params.sortName,
                        order: params.sortOrder,
                        pageNumber: params.pageNumber,
                    };
                },
                responseHandler: function (data) {
                    return {
                        total: data.total,
                        rows: data.rows
                    };
                },
                theadClasses: 'thead-light',
                columns: tablePromptsColumns
            }
            $('#tablePrompt').bootstrapTable(tableOptions);
            this.defaultPresetsTableData.forEach(column => {
                if (!column.checked) {
                    $('#tablePrompt').bootstrapTable('hideColumn', column.field);
                }
            });
        },
    },
    template: `
        <div class="card card-table mt-3 pb-4">
            <div class="card-body card-table">
                <div class="d-flex justify-content-between my-4">
                    <p class="font-h4 font-bold">Prompts</p>
                    <div class="d-flex">
                        <div class="complex-list">
                            <button class="btn btn-select btn-select__sm dropdown-toggle br-left d-flex align-items-center"
                                type="button"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                <p class="d-flex mb-0">
                                    <span class="complex-list_filled">{{ selectedPreset.name }}</span>
                                </p>
                            </button>
                            <div class="dropdown-menu dropdown-menu-right">
                                <ul class="my-0">
                                    <li
                                        class="dropdown-item dropdown-menu_item d-flex align-items-center justify-content-between"
                                        @click="selectPreset(preset)"
                                        v-for="preset in allPresets" :key="preset.name">
                                        <label
                                            class="mb-0 w-100 d-flex align-items-center justify-content-between">
                                            <span class="d-inline-block">{{ preset.name }}</span>
                                            <img v-if="preset.name === selectedPreset.name" src="/design-system/static/assets/ico/check.svg" class="ml-3">
                                        </label>
                                        <div class="pl-2">
                                            <button
                                                v-if="preset.name !== 'default'"
                                                class="btn btn-default btn-xs btn-table btn-icon__xs" @click.stop="deletePreset(preset.name)">
                                                <i v-if="!loadingDelete" class="fas fa-trash"></i>
                                                <i v-else class="preview-loader"></i>
                                            </button>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="dropdown_action" ref="presetToggle">
                            <button class="btn btn-secondary_item__right btn-secondary btn-icon"
                                    type="button"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    id="dropdownTablePreset">
                                <i class="fa fa-cog"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-right close-outside" style="width: 700px">
                                <div class="p-4">
                                    <div class="d-flex justify-content-between">
                                        <h3 class="font-h3 mr-4">{{ selectedPreset.name }}</h3>
                                        <div class="d-flex justify-content-start">
                                            <button
                                                v-if="selectedPreset.name !== 'default'"
                                                class="btn btn-basic d-flex align-items-center mr-2" @click.stop="updatePreset(selectedPreset.name)"
                                                >Save<i v-if="loadingUpdate" class="preview-loader__white ml-2"></i>
                                            </button>
                                            <button class="btn btn-secondary mr-2" @click="showModal = true">Save as...</button>
                                            <button
                                                type="button"
                                                class="btn btn-secondary"
                                                @click.stop="fillPresetTable">Reset</button>
                                        </div>
                                    </div>
                                    <div class="d-grid grid-column-4 gap-3 mt-4">
                                        <label class="mb-0 w-100 d-flex align-items-center custom-checkbox" v-for="field in customPresetsTableData" :key="field.title">
                                            <input class="mx-2" type="checkbox" v-model="field.checked" :value="field.field">
                                            <span class="w-100 d-inline-block">{{ field.title }}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="loadingTable" class="d-flex align-items-center justify-content-center" style="height: 270px">
                    <i class="preview-loader"></i>
                </div>
                <table
                    id="tablePrompt"
                    class="table table-border"
                    data-toggle="table"
                    data-unique-id="id"
                    data-page-list="[5, 10, 15]"
                    data-pagination="true"
                    data-side-pagination="server"
                    data-detail-view="true"
                    data-loading-template="loadingTemplate"
                    data-pagination-pre-text="<img src='/design-system/static/assets/ico/arrow_left.svg'>"
                    data-pagination-next-text="<img src='/design-system/static/assets/ico/arrow_right.svg'>"
                    data-page-size=5>
                </table>
                <modal-save-preset
                    v-if="showModal"
                    @close-modal="showModal = false"
                    @save-new-preset="savePresetAs"
                    :allPresets="allPresets"
                    :loading="loadingSaveAs"
                ></modal-save-preset>
            </div>
        </div>
    `
}
