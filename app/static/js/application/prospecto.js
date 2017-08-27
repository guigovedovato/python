$("#prospectoSearch").submit(function(e) {
    e.preventDefault(); //prevent submit
    data = serializeToJson($(this).serializeArray())
    search("/api/prospecto/", "/prospecto/edit/", ['cognome', 'nome', 'celular', 'ativo'], data, "convert");
});

$("#prospectoForm").submit(function(e) {
    e.preventDefault(); //prevent submit
    prepareComment();
    data = serializeToJson($(this).serializeArray());
    submitForm(data, "/api/prospecto", "prospectoForm", "Prospecto {0} salvo com sucesso.", "cognome", this);
});

function prepareComment() {
    var comment = JSON.stringify($("#comentario").val());
    new_comment = comment.substr(1);
    new_comment = new_comment.substr(0, new_comment.length - 1);
    $("#comentario").val(new_comment);
}

function analise(id) {
    dataSerialized = '{"analise":"' + id + '"}';
    $.getJSON("/api/prospecto/" + dataSerialized)
        .done(function(response) {
            $("#analise").val(response["message"]);
            $("#load").hide();
            setMessage("Análise realizada com sucesso.");
        })
        .fail(function() {
            $("#load").hide();
            setMessage("Houve um erro ao fazer a análise.");
        })
}

function doAnalise() {
    $("#load").show();
    id = $("#_id").html();
    if (!id) {
        dataSerialized = serializeToJson($("#prospectoForm").serializeArray());
        post = postData(dataSerialized, '/api/prospecto');
        post.done(function(response) {
            analise(response["_id"]["$oid"])
        });
        post.fail(function() {
            $("#load").hide();
            setMessage("Houve um erro ao salvar.");
        });
    } else {
        analise(id)
    }
}

function callAnaliseURL() {
    location.href = "/prospecto/analise/" + $("#_id").html();
}

$(document).ready(function() {
    today = getToday();
    document.getElementById("data_contato").setAttribute("max", today);
    document.getElementById("data_interesse").setAttribute("min", today);
});