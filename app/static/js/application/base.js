$(document).ready(function() {
    session();
    if (verifySession())
        setTimeout(research, 500);
    $("table").hide();
    if (document.getElementById("data_final")) {
        today = getToday();
        document.getElementById("data_final").setAttribute("max", today);
        document.getElementById("data_inicial").setAttribute("max", today);
    }
    if (document.getElementById("comune_select"))
        getComunes();
});

function session() {
    if (sessionStorage.current) {
        sessionStorage.last = sessionStorage.current;
        sessionStorage.current = window.location.pathname;
    } else {
        sessionStorage.search = false;
        sessionStorage.current = window.location.pathname;
    }
}

function canSearch() {
    return (String(sessionStorage.last).includes("novo") || String(sessionStorage.last).includes("edit")) &&
        (!String(sessionStorage.current).includes("novo") || !String(sessionStorage.current).includes("edit")) &&
        (verifyIsNewDomain())
}

function verifyIsNewDomain() {
    var last = (sessionStorage.last).split("/");
    var current = (sessionStorage.current).split("/");
    return current[1] == last[1]
}

function verifySession() {
    if (canSearch()) {
        if (sessionStorage.search == "true") {
            return true;
        } else {
            return false;
        }
    } else {
        if (sessionStorage.last == sessionStorage.current)
            sessionStorage.search = false;
        return false;
    }
}

function research() {
    $("#btnSubmit").click();
}

$("#data_inicial").change(function() {
    document.getElementById("data_final").setAttribute("min", this.value);
});

function getToday() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

function serializeToJson(serializer) {
    var _string = '{';
    for (var ix in serializer) {
        var row = serializer[ix];
        _string += '"' + row.name + '":"' + row.value + '",';
    }
    var end = _string.length - 1;
    _string = _string.substr(0, end);
    _string += '}';
    return JSON.stringify(JSON.parse(_string));
}

function clearMessage() {
    $("#message").empty();
}

function getTitle(title) {
    var typeTitle = "";
    switch (title) {
        case "Sucesso":
            typeTitle = "success";
            break;
        case "Erro":
            typeTitle = "error";
            break;
        case "Atenção":
            typeTitle = "attention";
            break;
    }
    return typeTitle;
}

function setMessage(title, msg, control = false) {
    clearMessage();
    var typeTitle = getTitle(title);
    $("#message").append("<div id='title' class='" + typeTitle + "'><span>" + title + "</span></div>");
    $("#message").append("<div id='msg'><span>" + msg + "</span></div>");
    if (control)
        $("#message").append('<div class="msgButtons"><input type="button" value="OK" onclick="setTimeout(window.location.reload(), 500);"></div>');
    else
        $("#message").append('<div class="msgButtons"><input type="button" value="OK" onclick="$(\'#messager\').hide();"></div>');
    $("#messager").show();
}

function getButtons(urlEdit, urlAction, id, convert) {
    btnc = "";
    if (convert != "") {
        btnc = '<img class="image-button btnConvert" src="static/images/convert.png" alt="Converter para Cliente"' +
            ' url=\'' + urlAction + '{"convert":"' + id + '"}' + '\' onclick="btnConvert(this)">';
    }
    btn = '<td>';
    btn += btnc;
    btn += '<img class="image-button btnEdit" src="static/images/edit.png" alt="Editar" _id="' +
        id + '" url="' + urlEdit + '" onclick="btnEdit(this)">' +
        '<img class="image-button btnInactivate" src="static/images/exclude.png" alt="Inativar" _id="' +
        id + '" url="' + urlAction + '" onclick="btnInactivate(this)">' +
        '</td>';
    return btn;
}

function btnEdit(btn) {
    location.href = $(btn).attr("url") + $(btn).attr("_id");
}

function btnInactivate(btn) {
    $("#load").show();
    $.ajax({
        url: $(btn).attr("url") + $(btn).attr("_id"),
        type: 'PUT',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ "ativo": "False" }),
        dataType: "json",
        success: function(response) {
            $("#load").hide();
            setMessage("Sucesso", "Registro inativado com sucesso.");
            $("#btnSubmit").click();
        }
    });
}

function btnConvert(btn) {
    $("#load").show();
    $.getJSON($(btn).attr("url"))
        .done(function(data) {
            $("#load").hide();
            setMessage("Sucesso", data);
            $("#btnSubmit").click();
        })
        .fail(function(data) {
            $("#load").hide();
            setMessage("Erro", "Houve um erro ao realizar esta operação.");
        });
}

function search(urlGET, urlEdit, fields, dataSerialized, convert = "") {
    sessionStorage.search = true;
    $("#load").show();
    tbody = $("tbody");
    tbody.empty();
    $.getJSON(urlGET + dataSerialized)
        .done(function(data) {
            if (data && data != "") {
                createTBody(data, tbody, urlGET, urlEdit, fields, dataSerialized, convert);
            } else {
                var tr = $('<tr>');
                tr.append('<td colspan="5" class="empty">Não foram encontrados registros para essa consulta.</td>');
                tbody.append(tr);
            }
            $("#load").hide();
            $("table").show();
        })
        .fail(function(data) {
            $("#load").hide();
            setMessage("Erro", "Houve um erro ao fazer a consulta.");
        });
}

function createTBody(data, tbody, urlGET, urlEdit, fields, dataSerialized, convert) {
    data.forEach(function(element) {
        var tr = $('<tr>');
        fields.forEach(function(attr) {
            if (attr == "ativo") {
                if (element[attr] == "True")
                    tr.append('<td>Sim</td>');
                else
                    tr.append('<td>Não</td>');
            } else if (attr.includes("operation")) {
                expression = JSON.parse(attr);
                values = expression["values"].split(',');
                result = operation(expression["operation"], element[values[0]], element[values[1]]);
                tr.append('<td>' + result + '</td>');
            } else {
                if (element[attr] != undefined)
                    tr.append('<td>' + element[attr] + '</td>');
                else
                    tr.append('<td></td>');
            }
        });
        tr.append(getButtons(urlEdit, urlGET, element["_id"]["$oid"], convert));
        tbody.append(tr);
    });
}

function operation(operation, val1, val2) {
    calc = "";
    switch (operation) {
        case "MINUS":
            calc = val1 - val2;
            break;
    }
    return calc;
}

String.prototype.format = function() {
    var formatted = this;
    for (var arg in arguments) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

function postData(dataSerialized, url) {
    return $.ajax({
        url: url,
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        data: dataSerialized,
        dataType: "json"
    });
}

function putData(dataSerialized, url) {
    return $.ajax({
        url: url + "/" + id,
        type: 'PUT',
        contentType: "application/json; charset=utf-8",
        data: dataSerialized,
        dataType: "json"
    });
}

function uploadArquivo(url, id, form, message, reset) {
    var formData = new FormData(form);
    $.ajax({
        url: url + "/" + id,
        type: 'POST',
        data: formData,
        async: false,
        cache: false,
        contentType: false,
        enctype: 'multipart/form-data',
        processData: false,
        success: function(response) {
            $("#load").hide();
            $("#arquivo").val('');
            if (response == true)
                setMessage("Sucesso", message, reset);
            else
                setMessage("Erro", "Houve um erro ao salvar o arquivo.");
        },
        error: function() {
            $("#load").hide();
            setMessage("Erro", "Houve um erro ao fazer o upload do arquivo.");
        }
    });
}

function submitForm(dataSerialized, url, reset, message, field, form) {
    $("#load").show();
    id = $("#_id").html();
    if (!id) {
        post = postData(dataSerialized, url);
        post.done(function(response) {
            setMessage("Sucesso", message.format(response[field]));
            if (reset)
                $(form)[0].reset();
        });
        post.fail(function() {
            setMessage("Erro", "Houve um erro ao salvar.");
        });
    } else {
        put = putData(dataSerialized, url);
        put.done(function(response) {
            if (document.getElementById("arquivo")) {
                if ($('#arquivo').val())
                    uploadArquivo(url, id, $(form)[0], message.format(response[field]), reset);
                else
                    setMessage("Sucesso", message.format(response[field]), reset);
            } else {
                setMessage("Sucesso", message.format(response[field]), reset);
            }
        });
        put.fail(function() {
            setMessage("Erro", "Houve um erro ao salvar.");
        });
    }
    $("#load").hide();
}

function getComunes() {
    comunes = $("#comune_select");
    $.getJSON('/api/comune/{"fields":["nome_comune"]}')
        .done(function(data) {
            data.forEach(function(element) {
                comunes.append(new Option(element["nome_comune"], element["nome_comune"]));
            });
        });
}

function prepareComment() {
    var comment = JSON.stringify($("#comentario").val());
    new_comment = comment.substr(1);
    new_comment = new_comment.substr(0, new_comment.length - 1);
    $("#comentario").val(new_comment);
}

function setComment() {
    var comment = $("#comentario").val();
    var input = comment.replace(/\r?\\n/g, '\n');
    $("#comentario").val(input);
}

function removeAlertClass() {
    $(".alerta").removeClass("alerta");
}

function removeRequiredClasses() {
    $(".required").removeClass("required");
}