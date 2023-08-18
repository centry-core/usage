const UsageTable = {
    data() {
        return {
            activeTab: 'tableActions'
        }
    },
    template: `
        <div class="card-table mt-4">
            <div class="d-flex justify-content-between">
                <div class="d-flex justify-content-end align-items-center pb-4">
                    <div>
                        <ul class="custom-tabs nav nav-pills mr-3" id="pills-tab" role="tablist">
                            <li class="nav-item" role="presentation" @click="activeTab = 'tableActions'">
                                <a class="active" id="pills-action-tab" data-toggle="pill" role="tab" aria-controls="action" aria-selected="true">Usage by action</a>
                            </li>
                            <li class="nav-item" role="presentation" @click="activeTab = 'tableDate'">
                                <a class="" id="pills-date-tab" data-toggle="pill" role="tab" aria-controls="date" aria-selected="false">Usage by date</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="tab-content">
                <div class="card-body px-0" v-show="activeTab === 'tableActions'">
                    <table class="table table-border"
                           id="vcu_table-actions"
                           data-toggle="table"
                           data-page-size=5
                           data-pagination="true"
                           data-pagination-parts='["pageInfoShort", "pageList"]'>
                        <thead class="thead-light">
                        <tr>
                            <th data-visible="false" data-field="id"></th>
                            <th scope="col" data-sortable="true" data-field="name">Name</th>
                            <th scope="col" data-sortable="true" data-field="type">Type</th>
                            <th scope="col" data-sortable="true" data-field="date">Date</th>
                            <th scope="col" 
                                data-sortable="true" 
                                data-field="platform_vcu">
                                <span 
                                    data-toggle="tooltip" 
                                    data-placement="top" 
                                    title="Platform VCU">
                                    Plt vcu
                                </span>
                            </th>
                            <th scope="col" data-sortable="true" data-field="project_vcu">
                                <span 
                                    data-toggle="tooltip"
                                    data-placement="top" 
                                    title="Project VCU">
                                    Prj vcu
                                </span>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <div class="card-body px-0" v-show="activeTab === 'tableDate'">
                    <table class="table table-border"
                           id="vcu_table-data"
                           data-toggle="table"
                           data-page-size=5
                           data-pagination="true"
                           data-pagination-parts='["pageInfoShort", "pageList"]'>
                        <thead class="thead-light">
                        <tr>
                            <th data-visible="false" data-field="id"></th>
                            <th scope="col" data-sortable="true" data-field="date">Date</th>
                            <th scope="col" data-sortable="true" data-field="platform_vcu">Platform vcu</th>
                            <th scope="col" data-sortable="true" data-field="project_vcu">Project vcu</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
}