const StorageTable = {
    data() {
        return {
            activeTab: 'tableBucket'
        }
    },
    template: `
        <div class="card-table mt-4">
            <div class="d-flex justify-content-between">
                <div class="d-flex justify-content-end align-items-center pb-4">
                    <div>
                        <ul class="custom-tabs nav nav-pills mr-3" id="pills-tab" role="tablist">
                            <li class="nav-item" role="presentation" @click="activeTab = 'tableBucket'">
                                <a class="active" id="pills-action-tab" data-toggle="pill" href="#pills-action" role="tab" aria-controls="action" aria-selected="true">Bucket usage</a>
                            </li>
                            <li class="nav-item" role="presentation" @click="activeTab = 'tableThroughput'">
                                <a class="" id="pills-date-tab" data-toggle="pill" href="#pills-date" role="tab" aria-controls="date" aria-selected="false">Throughput</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="tab-content">
                <div class="card-body px-0" v-show="activeTab === 'tableBucket'">
                    <div class="card-body px-0">
                        <table class="table table-border"
                               id="storage_table"
                               data-toggle="table"
                               data-page-size=5
                               data-pagination="true"
                               data-pagination-parts='["pageInfoShort", "pageList"]'>
                            <thead class="thead-light">
                            <tr>
                                <th scope="col" data-sortable="true" data-field="bucket">Bucket</th>
                                <th scope="col" data-sortable="true" data-field="readable_size">Size</th>
                                <th scope="col" data-sortable="true" data-field="retention">Retention</th>
                            </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-body px-0" v-show="activeTab === 'tableThroughput'">
                    <div class="card-body px-0">
                        <table class="table table-border"
                               id="throughput_table"
                               data-toggle="table"
                               data-page-size=5
                               data-pagination="true"
                               data-pagination-parts='["pageInfoShort", "pageList"]'>
                            <thead class="thead-light">
                            <tr>
                                <th scope="col" data-sortable="true" data-field="date">Date</th>
                                <th scope="col" data-sortable="true" data-field="throughput" data-formatter="formatBytes">Throughput</th>
                            </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `
}