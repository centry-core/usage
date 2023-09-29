var tablePromptsColumns = [
    {
        title: 'Project ID',
        field: 'project_id',
        sortable: true,
    }, {
        title: 'user',
        field: 'user',
        sortable: true,
    }, {
        title: 'date',
        field: 'date',
        sortable: true,
        class: 'min-w-175 ',
    }, {
        title: 'prompt id',
        field: 'prompt_id',
        sortable: true,
    }, {
        title: 'prompt name',
        field: 'prompt_name',
        sortable: true,
    }, {
        title: 'version',
        field: 'version',
        sortable: true,
    },{
        title: 'integration id',
        field: 'integration_uid',
        sortable: true,
        formatter: 'ParamsTable.uidFormatter',
    },{
        title: 'model name',
        field: 'model_name',
        sortable: true,
    },{
        title: 'temperature',
        field: 'temperature',
        sortable: true,
    },{
        title: 'max tokens',
        field: 'max_tokens',
        sortable: true,
    },
    {
        title: "max decode steps",
        field: "max_decode_steps",
        sortable: true,
    },
    {
        title: "top k",
        field: "top_k",
        sortable: true,
    },
    {
        title: 'top p',
        field: 'top_p',
        sortable: true,
    },
    {
        title: 'input',
        field: 'input',
        sortable: true,
        formatter: 'ParamsTable.singleTextareaFormatter',
    },
    {
        title: 'output',
        field: 'response',
        formatter: 'ParamsTable.singleTextareaFormatter',
    },
    {
        title: 'context',
        field: 'context',
        sortable: true,
        formatter: 'ParamsTable.singleTextareaFormatter',
    },
    {
        title: 'examples',
        field: 'examples',
        formatter: 'ParamsTable.booleanFormatter',
    },
    {
        title: 'variables',
        field: 'variables',
        formatter: 'ParamsTable.booleanFormatter',
    },
    {
        title: 'run time',
        field: 'run_time',
        sortable: true,
    },
    {
        title: 'status',
        field: 'status_code',
        sortable: true,
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
    booleanFormatter(value, row, index, field) {
        return value ? 'Has' : '-'
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
        if (!value) return
        const text = value.slice(0, 20);
        return `
            <div class="custom-input custom-input__sm" style="width: 150px;">
                <input type="text" value="${text}..." disabled>
            </div> 
        `
    },
}