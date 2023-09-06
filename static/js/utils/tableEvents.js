var tablePromptsColumns = [
    {
        title: 'Project ID',
        field: 'project_id',
        class: 'vertical-align-top',
        sortable: true,
    }, {
        title: 'user',
        field: 'user',
        class: 'vertical-align-top',
        sortable: true,
    }, {
        title: 'date',
        field: 'date',
        sortable: true,
        class: 'min-w-175 vertical-align-top',
    }, {
        title: 'prompt id',
        field: 'prompt_id',
        class: 'vertical-align-top',
        sortable: true,
    }, {
        title: 'prompt name',
        field: 'prompt_name',
        class: 'vertical-align-top',
        sortable: true,
    }, {
        title: 'version',
        field: 'version',
        class: 'vertical-align-top',
        sortable: true,
    },{
        title: 'integration id',
        field: 'integration_uid',
        class: 'vertical-align-top',
        sortable: true,
        formatter: 'ParamsTable.uidFormatter',
    },{
        title: 'model name',
        field: 'model_name',
        class: 'vertical-align-top',
        sortable: true,
    },{
        title: 'temperature',
        field: 'temperature',
        class: 'vertical-align-top',
        sortable: true,
    },{
        title: 'max tokens',
        field: 'max_tokens',
        class: 'vertical-align-top',
        sortable: true,
    },
    {
        title: "max decode steps",
        field: "max_decode_steps",
        class: 'vertical-align-top',
        sortable: true,
    },
    {
        title: "top k",
        field: "top_k",
        class: 'vertical-align-top',
        sortable: true,
    },
    {
        title: 'top p',
        field: 'top_p',
        class: 'vertical-align-top',
        sortable: true,
    },
    {
        title: 'input',
        field: 'input',
        sortable: true,
        class: 'vertical-align-top',
        formatter: 'ParamsTable.singleTextareaFormatter',
    },
    {
        title: 'context',
        field: 'context',
        sortable: true,
        class: 'vertical-align-top',
        formatter: 'ParamsTable.singleTextareaFormatter',
    },
    {
        title: 'examples',
        field: 'examples',
        formatter: 'ParamsTable.textareaFormatter',
        class: 'min-w-175 pl-1 vertical-align-top',
    },
    {
        title: 'variables',
        field: 'variables',
        formatter: 'ParamsTable.textareaFormatter',
        class: 'min-w-175 pl-1 vertical-align-top',
    },
    {
        title: 'run time',
        field: 'run_time',
        class: 'vertical-align-top',
        sortable: true,
    },
    {
        title: 'status',
        field: 'status_code',
        class: 'vertical-align-top',
        sortable: true,
        formatter: 'ParamsTable.statusFormatter',
    }
]

var ParamsTable = {
    uidFormatter(value, row, index, field) {
        return `
                <div class="custom-input custom-input__sm">
                    <input type="text" value="${value}" disabled>
                </div> 
            `
    },
    textareaFormatter(value, row, index, field) {
        if (value) {
            return `
                <div id="${field}_${row.id}">
                    <button id="${field}_${row.id}" class="btn btn-secondary d-flex align-items-center" onclick="ParamsTable.fillCell('${field}', '${row.id}')">Show ${field}</button>
                </div> 
            `
        }
    },
    fillCell(field, rowId) {
        const loader = '<i class="preview-loader ml-2"></i>';
        $(`#${field}_${rowId} button`).append(loader);
        ApiGetPromptField(field, rowId).then(data => {
            if (data.value.length) {
                const collapseId = `collapse_${rowId}_${field}`
                const collapse = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-uppercase">${field}</span>
                        <button class="btn btn-nooutline-secondary" type="button" data-toggle="collapse" data-target="#${collapseId}">
                           <i class="icon__16x16 icon-arrow-down__16"></i>
                        </button>
                    </div>
                    <div class="collapse" id="${collapseId}">
                        <div>
                            ${data.value.map(row => {
                            switch (field) {
                                case 'variables':
                                    var { name: firstValue, value: secondValue } = row;
                                    break
                                case 'examples':
                                    var { input: firstValue, output: secondValue } = row;
                                    break
                            }
                            return `
                                <div class="d-flex gap-3 mt-1" style="width: 300px">
                                    <div class="position-relative">
                                        <textarea class="form-control form-control-alternative" style="color: var(--green);" disabled
                                            rows="3">${firstValue}</textarea>
                                    </div>
                                    <div class="position-relative">
                                        <textarea class="form-control form-control-alternative" style="color: var(--basic);" disabled
                                            rows="3">${secondValue}</textarea>
                                    </div>
                                </div>
                            `
                    }).join('')}
                        </div>
                    </div>
                `
            $(`#${field}_${rowId} button`).removeClass('d-flex').hide();
            $(`#${field}_${rowId}`).append(collapse)
            }
        })
    },
    fillTextCell(field, rowId) {
        const loader = '<i class="preview-loader ml-2"></i>';
        $(`#${field}_${rowId} button`).append(loader);
        ApiGetPromptField(field, rowId).then(data => {
            const elem = `
                <div class="position-relative">
                    <textarea class="form-control form-control-alternative" disabled style="width: 144px"
                        rows="3">${data.value}</textarea>
                </div>
            `
            $(`#${field}_${rowId} button`).removeClass('d-flex').hide();
            $(`#${field}_${rowId}`).append(elem)
        })
    },
    singleTextareaFormatter(value, row, index, field) {
        if (value.length < 50) {
            return `
                <div class="custom-input custom-input__sm">
                    <input type="text" value="${value}" disabled>
                </div> 
            `
        } else {
            return `
                <div id="${field}_${row.id}">
                    <button id="${field}_${row.id}" class="btn btn-secondary d-flex align-items-center" onclick="ParamsTable.fillTextCell('${field}', '${row.id}')">Show ${field}</button>
                </div> 
            `
        }
    },
    statusFormatter(value) {
        if (+value < 400) {

        }
    }
}