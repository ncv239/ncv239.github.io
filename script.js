const $table = $('#table')


function operateFormatter(value, row, index) {
// https://examples.bootstrap-table.com/#column-options/formatter.html#view-source
  return [
    '<a class="remove" href="javascript:void(0)" title="Remove">',
    '<i class="bi bi-trash"></i></i>',
    '</a>  ',
    '<a class="edit" href="javascript:void(0)" title="Edit">',
    '<i class="bi bi-pen"></i>',
    '</a>'
  ].join('')
}


function addCheckBoxListener(){
    /*
     * Function add event listener to hard-coded checkboxes
     * so that TableFilter is triggered on click. 
     * TODO: Re-Implement with onValueChange (accessabillity issues - keyboard input)
     *
     * Should be executed on DOM load (when DOM-nodes have been loaded)
     */

    // generate list with checkbox names
    let cb_list = []
    for (let i = 1; i < 16; i++) {
        cb_list.push("_cb" + i.toString());
    }
    
    // loop over all checkboxes
    for (i = 0; i < cb_list.length; i++) {
        let cb = document.getElementById(cb_list[i]);
        if (cb == null) {
            // if elemenet does not exist, skip it
            continue;
        }
        cb.addEventListener("click", () => {
            toggleCustomTableFilter();
        })
    }
}

function getLabelText(object) {
    var labels = document.getElementsByTagName("label");
    for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        if(label.getAttribute("for") == object.id) {
            return label.innerText;
        }
    }
    return null;
}


function populateSelectProvider(data) {
    // Currently fetches the data from url
    // better implementation would be to get data from already loaded bootstrap-table
    
    let providers = data.flatMap(item => item.provider);
    let unique_providers = [...new Set(providers)];
    unique_providers.sort();

    // Delete old options of the dropdown 
    $('#providerSelector').find('option').remove();

    // add options
    var providerSelector = document.getElementById("providerSelector");
    for (var i = 0; i < unique_providers.length; i++) {
        let opt = document.createElement('option');
        opt.value = unique_providers[i];
        opt.innerHTML = unique_providers[i];
        providerSelector.appendChild(opt);
    }
    
    // refresh the select picker
    $("#providerSelector").selectpicker("refresh");

}


function toggleCustomTableFilter() {
    var filters = {};
    
    // get the selected providers
    var selectedProviderOpts = document.querySelectorAll('#providerSelector option:checked');
    var selectedProviders = Array.from(selectedProviderOpts).map(item => item.value);

    // if some providers are selected
    if (selectedProviders.length > 0) {
        filters["selectedProviders"] = selectedProviders;
    }

    //get name form search bar
    var current_name = document.getElementById('organisation-names-input').value;

    // if some names are selected
    let minNameLength = 3;
    if (current_name.length >= minNameLength) {
        filters["names"] = current_name;
    }

    // store to filters dict only checkboxes taht are checked
    for (let i = 1; i < 16; i++) {
        let cb = document.getElementById("_cb" + i.toString())
        if (cb.checked) {
            filters[cb.id] = cb;
            }
    }
    // if no checkboxes are checked, do nothing
    if (Object.keys(filters).length === 0) {
        // hack to deselect filter (no filters are set)
        $table.bootstrapTable('filterBy', {_: true}, {"filterAlgorithm": (row, filters) => {return true;} });
    } else {
        $table.bootstrapTable('filterBy', filters, {
            "filterAlgorithm": (row, filters) => {
                // filter rows that have an attribute named as the label
                // of a given checked checkbox and this attribute has value `true`
                ans = true;
                for (let [k, v] of Object.entries(filters)) {
                    if (k === "selectedProviders") {
                        // filter by selected provider
                        ans &&=  filters["selectedProviders"].includes(row["provider"]);
                    } else if (k === "names") {
                        // filter by names
                        if (row["name"].toLowerCase().includes(filters["names"].toLowerCase()) === false) {return false;};
                    } else {
                        // filter by checkboxes
                        // ans &&= row[getLabelText(v)] === true;
                        if (row[getLabelText(v)] === false) { return false;}
                    }
                }
                return  ans;
            }
        })
    }
    // update number of entries in the table
    var tbodyRowCount2 = $table.bootstrapTable("getData", {"unfiltered": false}).length;
    document.getElementById("span_nDataRows").innerHTML = tbodyRowCount2;
}

function clearAllFilters() {
    // uncheck all checkboxes
    for (let i = 1; i < 16; i++) {
        let cb = document.getElementById("_cb" + i.toString());
        cb.checked = false;
    }
    // clear providerSelector
    $('#providerSelector').selectpicker('deselectAll').selectpicker('refresh');

    // clear org-name search
    document.getElementById('organisation-names-input').value = "";
    
    // clear bs-table searchBox
    $table.bootstrapTable("resetSearch","");
    // update table view
    toggleCustomTableFilter();
}


function populateAutocompleteOrganisationSearch () {
    // get data with organisation names , no need to filter or sort it
    let data = $table.bootstrapTable("getData", {"unfiltered": true});
    let orgs = data.flatMap((item) => item.name.trim());
    orgs.sort()

    // add <option> children to datalist for the selector
    let datalist = document.querySelector("datalist#organisation-names")
    for (var i = 0; i < orgs.length; i++) {
        let opt = document.createElement('option');
        opt.value = orgs[i];
        opt.innerHTML = orgs[i];
        datalist.appendChild(opt);
    }
}

function addValidationEventForOrganisationSearch() {
    let search = document.getElementById('organisation-names-input');
    let datalist = document.getElementById('organisation-names');
    var delay = 500;
    var timeoutId;
    var minlength = 3;

    search.addEventListener('input', () => {
        clearTimeout(timeoutId);
        search.classList.remove("is-invalid")
        search.classList.remove("is-valid")

        // filter and validate only if we need to!
        if (search.value.length >= minlength || search.value.length === 0 ) {

            // fitler results in the table
            timeoutId = setTimeout(() => {
                toggleCustomTableFilter()
            }, delay);
        }
        // validate input only if something is typed
        if (search.value.length !== 0) {
            var optionFound = false;
            // Determine whether an option exists with the current value of the input.
            for (var j = 0; j < datalist.options.length; j++) {
                if (search.value == datalist.options[j].value) {
                    optionFound = true;
                    break;
                }
            }
            // use the setCustomValidity function of the Validation API
            // to provide an user feedback if the value does not exist in the datalist
            if (optionFound) {
                search.setCustomValidity('');
                search.classList.add("is-valid")
            } else {
                search.setCustomValidity('Bitte wählen Sie einen Einrichtungsnamen');
                search.classList.add("is-invalid")
            }
        }
        
})

}


// ------------------------------------------------
// 
// MAIN FUNCTION
// 
// ------------------------------------------------

document.addEventListener("DOMContentLoaded", function(){
    window.operateEvents = {
        'click .edit': function (e, value, row, index) {
            alert('You click edit action, row: ' + JSON.stringify(row))
        },
        'click .remove': function (e, value, row, index) {
            // alert('You click delete action, row: ' + JSON.stringify(row))
            $table.bootstrapTable('remove', {
                field: 'id',
                values: [row.id]
            })
            document.getElementById("span_nDataRows").innerHTML = $table.bootstrapTable("getData", {"unfiltered": false}).length;
        }
      }
    addCheckBoxListener(); 
})


window.addEventListener("load", (event) => {
})


$table.on('load-success.bs.table', function (e) {
    // write number of data-rows on load
    populateSelectProvider($table.bootstrapTable("getData", {"unfiltered": true}));
    populateAutocompleteOrganisationSearch();
    addValidationEventForOrganisationSearch();
    document.getElementById("span_nDataRows").innerHTML = $table.bootstrapTable("getData", {"unfiltered": false}).length;
})


$table.on('search.bs.table', function (e) {
    // write number of data-rows on load
    document.getElementById("span_nDataRows").innerHTML = $table.bootstrapTable("getData", {"unfiltered": false}).length;
})


function exportTable() {
    JsLoadingOverlay.show();
    setTimeout(function(){
        $table.bootstrapTable("exportTable", {
            "fileName": "export",
            "type": "excel"
        })
    }, 100)
}


$table.on('export-started.bs.table', function (e) {
    
})
$table.on('export-saved.bs.table', function (e) {
    JsLoadingOverlay.hide();

})