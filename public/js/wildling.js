var ViewModel = function(editor) {
    var self = this;

    var serviceUrl = 'http://127.0.0.1:2201/wildling/api/';

    self.editor = editor;
    self.versionVector = ko.observable();
    self.wildlingKey = ko.observable('foo');
    self.selectedIndex = ko.observable();
    
    self.wildlingValueObjArray = ko.observableArray();
    self.wildlingValueStrArray = ko.pureComputed({
        read: function() {
            var strArray = ko.utils.arrayMap(self.wildlingValueObjArray(), function(item) {
                return ko.toJSON(item, null, '    ');  
            });
            return strArray;
        },
        write: function (array) {
            var objArray = ko.utils.arrayMap(array, function(item) {
                return ko.parseJSON(item);
            });
            return objArray;
        },
        owner: this
    });
    
    self.wildlingGet = function(formElement) {
        $.ajax({
            type: 'GET',
            url: serviceUrl + self.wildlingKey()
        })
        .done(function (data, textStatus, jqXHR) {
            if (data) {
                self.wildlingValueObjArray(data);
                
                var vv = jqXHR.getResponseHeader('X-Context');
                self.versionVector(vv);
                
                var item = data[data.length-1];
                self.selectedIndex(data.length-1);
                self.editor.setValue(ko.toJSON(item, null, '    '));
            }
            else {
                self.VersionVector("");
                self.wildlingValueObjArray([]);
                self.editor.setValue(null);
                self.selectedIndex(-1);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log( "error" );
            self.versionVector("");
            self.wildlingValueObjArray([]);
            self.editor.setValue(null);
            self.selectedIndex(-1);
        })
        .always(function() {
            console.log( "complete" );
        });
    };
    
    self.wildlingPut = function() {
        $.ajax({
            type: 'PUT',
            url: serviceUrl + self.wildlingKey(),
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-Context', self.versionVector());   
            },
            contentType: 'application/json',
            data: self.editor.getValue()
        })
        .done(function (data) {
            toastr.success('success');
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log( "error" );
            toastr.warning(jqXHR.responseText);
        })
        .always(function() {
            console.log( "complete" );
        });
    };
    
    self.selectValue = function(index) {
        self.selectedIndex(index);
        var item = self.wildlingValueObjArray()[index];
        self.editor.setValue(ko.toJSON(item, null, '    '));
    };
};

$(document).ready(function() {
    var editor = ace.edit('editor');
    editor.setTheme('ace/theme/monokai');
    var session = editor.getSession();
    session.setMode('ace/mode/json');
    session.setTabSize(4);

    ko.applyBindings(new ViewModel(editor));
});