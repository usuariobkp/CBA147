﻿var permiso;
var datosService;
var areas;
var ambito;
var estados;

$(document).ready(function () {
    $('.tooltipAyuda').each(function () { // Notice the .each() loop, discussed below
        $(this).qtip({
            content: {
                text: $(this).next('div') // Use the "div" element next to this for the content
            },
            position: {
                my: 'top center',
                at: 'bottom center'
            },
            style: {
                classes: 'qtip-shadow qtip-rounded qtip-tipsy'
            }
        });
    });
});

function init(data) {
    data = parse(data);

    permiso = data.Permiso;

    ambito = getUsuarioLogeado().Ambito;
    areas = getUsuarioLogeado().Areas;
    estados = data.Estados;



    initConsulta();
    initResultado();
    initTablaEstadistica();

    //----------------------
    // Anim inicial
    //----------------------

    $('#cardConsulta').css('opacity', 0);
    $('#cardConsulta').css('top', '50px');
    setTimeout(function () {
        $('#cardConsulta').animate({ opacity: 1, top: '0px' }, 300);
    }, 500);

    setTimeout(function () {
        ControlSelectorRangoFecha_SetSelectIndex(4);
        setTimeout(function () {
            consultar2();
        }, 500);
    }, 500);



    $('#btn_Acciones').click(function () {
        $('#contenedor_Acciones .contenido').toggleClass('visible');
        $(this).text($('#contenedor_Acciones .contenido').hasClass('visible') ? 'Ocultar Info' : 'Ver Info');
    });
}

function initConsulta() {


    //--------------------------
    // Fechas
    //--------------------------

    ControlSelectorRangoFecha_SetOnMensajeListener(function (tipo, mensajes) {
        mostrarMensaje(tipo, mensajes);
    });

    //--------------------------
    // Ambito
    //--------------------------
    if (ambito != null) {
        $('#textoAmbito').text(toTitleCase(ambito.Nombre));
    } else {
        $('#textoAmbito').text("Municipalidad de Córdoba");
    }

    //--------------------------
    // Areas
    //--------------------------
    if (areas != undefined) {
        //Cargo los datos
        if (areas.length > 1) {
            $('#select_Area').CargarSelect({
                Data: areas,
                Value: 'Id',
                Text: 'Nombre',
                Default: 'Todas las áreas',
                Sort: true
            });
        } else {
            $('#select_Area').CargarSelect({
                Data: areas,
                Value: 'Id',
                Text: 'Nombre',
                Sort: true
            });
        }

        //Evento clic en area
        $('#select_Area').on('change', function (e) {
            var value = $(this).val();
            if (value == -1) {
                $('#contenedorSelectSubarea').hide();
                $('#select_Subarea').CargarSelect({
                    Data: [],
                    Value: 'Id',
                    Text: 'Nombre',
                    TitleCase: false
                });
                return;
            }
            var areaSeleccionado = (_.where(areas, { Id: parseInt(value) }));
            if (areaSeleccionado[0].Subareas != null && areaSeleccionado[0].Subareas.length != 0) {
                $('#select_Subarea').CargarSelect({
                    Data: areaSeleccionado[0].Subareas,
                    Value: 'Id',
                    Text: 'Nombre',
                    Default: "Todas",
                    TitleCase: false
                });

                $('#contenedorSelectSubarea').show();
            } else {
                $('#contenedorSelectSubarea').hide();
                $('#select_Subarea').CargarSelect({
                    Data: [],
                    Value: 'Id',
                    Text: 'Nombre',
                    TitleCase: false
                });
            }
        });
    }


    //--------------------------
    // Estados
    //--------------------------

    estados.forEach(function (estado) {
        $('#checkboxEstados').AgregarCheckbox({
            Name: estado.Nombre,
            Value: estado.Id,
        });
        $('#checkboxEstados').find('#cblb' + estado.Id).html('<div class="indicador-estado" style="background-color: #' + estado.Color + '"/>' + toTitleCase(estado.Nombre));

        var arrayKeyValue = [1, 2, 4, 5, 7, 8, 9];
        if (jQuery.inArray(estado.KeyValue, arrayKeyValue) !== -1) {
            $('#checkboxEstados').find('#cblb' + estado.Id).trigger('click');
        }

    });


    //-------------------------
    // Botones
    //-------------------------

    $('#btnGenerar').click(function () {
        if (!validarConsulta()) {
            return;
        }
        consultar2();
    });
}

function initResultado() {

    initTablaEstadistica();

    //-------------------------
    // Tipo Grafico
    //-------------------------

    $('#radio_Barra').on('change', function () {
        if ($(this).is(':checked')) {
            $('#contenedorGrilla').hide();
            $('#contenedorGraficos').show();
            $("#chart-containerBarra").addClass('visible');
            $("#chart-containerTorta").removeClass('visible');
        }
    });

    $('#radio_Torta').on('change', function () {
        if ($(this).is(':checked')) {
            $('#contenedorGrilla').hide();
            $('#contenedorGraficos').show();
            $("#chart-containerBarra").removeClass('visible');
            $("#chart-containerTorta").addClass('visible');
        }
    });

    $('#radio_Grilla').on('change', function () {
        if ($(this).is(':checked')) {
            cargarEstadistica();
            $("#btnGenerarExcel").show();
            $('#contenedorGrilla').show();
            $('#contenedorGraficos').hide();
        }
    });


    //-------------------------
    // Botones
    //-------------------------

    $('#btnVolver').click(function () {
        // ControlSelectorRangoFecha_Limpiar();
        //ControlSelectorMes_Limpiar();
        $("#radio_Barra").trigger('click');
        $('#cardEstadisticas').stop(true, true).fadeOut(300, function () {
            $('#cardConsulta').stop(true, true).fadeIn(300);
        });
        $('#cardConsulta').find('.cargando').stop(true, true).fadeOut(300);
    });

    $('#btnGenerarMapa').click(function () {
        generarMapa();
    });

    $('#btnGenerarMapaCriticidad').click(function () {
        generarMapaCpc(data_grafico);
    });
    $('#btnGenerarExcel').click(function () {

        setTimeout(function () {
            $('#cardConsulta').animate({ opacity: 1, top: '0px' }, 300);
        }, 500);

        /*Siempre descarga el mismo pdf*/

        //if ($('#radio_Grilla').is(':checked')) {
        //    $("#contenedorGrilla .buttons-excel").trigger('click');
        //}
        //if ($('#radio_Torta').is(':checked')) {

        //    let t = 0;
        //    if ($('#contenedor_Acciones .contenido').hasClass('visible')) {
        //        $('#btn_Acciones').trigger('click');
        //        t = 500;
        //    }
        //    var getBase64 = obtenerBase64Grafico();
        //    setTimeout(function () {
        //        crearDialogoReporteEstadisticaCPC(getBase64, datosService.consulta);
        //    }, t);
        //}

        //if ($('#radio_Barra').is(':checked')) {
        //    if ($('#contenedor_Acciones .contenido').hasClass('visible')) {
        //        $('#btn_Acciones').trigger('click');
        //    }
        //    var getBase64 = obtenerBase64Grafico();
        //    crearDialogoReporteEstadisticaCPC(getBase64, datosService.consulta);

        //}


        let t = 0;
        if ($('#contenedor_Acciones .contenido').hasClass('visible')) {
            $('#btn_Acciones').trigger('click');
            t = 500;
        }
        var getBase64 = obtenerBase64Grafico();
        setTimeout(function () {
            crearDialogoReporteEstadisticaMotivos(getBase64, datosService.consulta, getTextoFiltrosConsulta());
        }, t);
    });
}

function validarConsulta() {
    //Oculto los errores
    $('#cardConsulta').find('.control-observacion').stop(true, true).slideUp(300);

    var valido = true;


    //Si esta tildada la opcion de solo mes valida el rango de fechas , si no valida el input del mes
    if (!ControlSelectorCheckboxMes_GetState()) {
        //Fechas
        if (!ControlSelectorRangoFecha_Validar()) {
            valido = false;
        }
    } else {
        if (!ControlSelectorMes_Validar()) {
            valido = false;
        }
    }

    //Estados
    var tieneEstado = false;
    var controles = $('#checkboxEstados').find("input[type='checkbox']");
    $.each(controles, function (index, checkbox) {
        if ($(checkbox).is(":checked")) {
            tieneEstado = true;
        }
    });

    if (!tieneEstado) {
        mostrarMensaje('Alerta', 'Debe seleccionar algun estado');
        return false;
    }

    return valido;
}

function getFiltrosConsulta() {

    var filtros = {};


    //Fechas
    var fechaDesde = ControlSelectorRangoFecha_GetFechaDesde();
    var fechaHasta = ControlSelectorRangoFecha_GetFechaHasta();
    if (fechaDesde != undefined && fechaHasta != undefined) {
        filtros.FechaDesde = fechaDesde.toDate();
        filtros.FechaHasta = fechaHasta.toDate();
    }

    //Mes y Año
    var mesSelect = ControlSelectorRangoFecha_GetMes();
    var añoSelect = ControlSelectorRangoFecha_GetAño();
    if (mesSelect != undefined && añoSelect != undefined) {
        var mes = mesSelect
        var año = añoSelect;
        filtros.Mes = mes;
        filtros.Año = año;
    }

    //Areas
    var arrAreas = [];
    var valueArea = $('#select_Area').val();
    //Si estan todas seleccionadas
    if (valueArea == -1) {
        $.each(areas, function (index, area) {
            var obj = {};
            obj.Id = (area.Id);
            if (area.Subareas != null && area.Subareas.length != 0) {
                var arrSubArea = _.pluck(area.Subareas, 'Id');
                obj.IdsHijos = arrSubArea;
            } else {
                obj.IdsHijos = null;
            }
            arrAreas.push(obj);
        });
    }
        //si esta seleccionada una sola area
    else {
        var areaSeleccionado = (_.where(areas, { Id: parseInt(valueArea) }))[0];
        var obj = {}
        obj.Id = (areaSeleccionado.Id);
        if (areaSeleccionado.Subareas != null && areaSeleccionado.Subareas.length != 0) {
            var arrSubArea = _.pluck(areaSeleccionado.Subareas, 'Id');
            obj.IdsHijos = arrSubArea;
        } else {
            obj.IdsHijos = null;
        }
        arrAreas.push(obj);
    }
    filtros.Areas = arrAreas;


    //Estados
    var estadosKeyValue = [];
    var controles = $('#checkboxEstados').find("input[type='checkbox']");
    $.each(controles, function (index, checkbox) {
        if ($(checkbox).is(":checked")) {
            var estado = $.grep(estados, function (element, index) {
                return element.Id == $(checkbox).val();
            })[0];

            if (estado != undefined) {
                estadosKeyValue.push(estado.KeyValue);
            }
        }
    });
    filtros.EstadosKeyValue = estadosKeyValue;



    return filtros;
}

function getTextoFiltrosConsulta() {
    var filtros = "";
    $.each(getFiltrosConsulta(), function (key, val) {
        switch (key) {

            case 'EstadosKeyValue': {
                key = 'Estados';
                if (val.length == 0) return true;
                var estadosString = "";
                $.each(val, function (index, estado) {
                    if (estadosString != "") {
                        estadosString += ', ';
                    }
                    estadosString += toTitleCase($.grep(estados, function (e) { return e.KeyValue == estado; })[0].Nombre);
                });
                val = estadosString;
            } break;


            case 'FechaDesde': {
                var fechaDesde = moment(ControlSelectorRangoFecha_GetFechaDesde().toDate()).format('DD-MM-YYYY')
                key = 'Fecha desde';
                val = fechaDesde;
            } break;

            case 'FechaHasta': {
                var fechaHasta = moment(ControlSelectorRangoFecha_GetFechaHasta().toDate()).format('DD-MM-YYYY')
                key = 'Fecha hasta';
                val = fechaHasta;
            } break;

            case 'Mes': {
                let mes = ControlSelectorRangoFecha_GetTextoMes(parseInt(val));
                key = 'Mes';
                val = mes;
            } break;
            case 'Año': {
                var año = ControlSelectorRangoFecha_GetAño()
                key = 'Año';
                val = año;
            } break;

            case 'Areas': {
                key = 'Area/s';
                if ((ambito.KeyValue != 0 && val.length > 1) || val.length > 10) {
                    val = "Todas las areas de la municipalidad";
                    break;
                }
                var areasString = "";
                var areasSeleccionadas = val;

                $.each(areasSeleccionadas, function (index, area) {
                    if (areasString != "") {
                        areasString += ', ';
                    }
                    var select = $('#select_Area').val();
                    /*si estan marcadas todas o el area elegida no tiene hijos busca por las areas principales sin inmportar las hijas*/
                    if (select == -1 || area.IdsHijos == null) {
                        var areaPrincipal = _.findWhere(areas, { Id: area.Id });
                        areasString += areaPrincipal.Nombre;
                    } else {

                        //Hay q ver que hacer en caso de la hija para sacarle el nombre 
                        var idSelectSubarea = parseInt($('#select_Subarea').val());
                        var areaPrincipal2 = _.findWhere(areas, { Id: area.Id });
                        var subareas = areaPrincipal2.Subareas;
                        var buscoHija = _.findWhere(subareas, { Id: idSelectSubarea });
                        if (buscoHija != null && buscoHija != undefined) {
                            areasString += buscoHija.Nombre;
                        }

                    }
                });
                val = areasString;
            } break;



        }

        if (val == undefined) {
            return true;
        }

        if (filtros != "") {
            filtros += " - ";
        }
        filtros += '<u>' + key + "</u> " + val;
    });

    return '<b>Filtros</b> ' + filtros;
}

function consultar2() {

    if (!validarConsulta()) {
        return;
    }

    var filtros = getFiltrosConsulta();
    if (filtros == null) {
        Materialize.toast('Debe seleccionar algun filtro de busqueda', 5000);
        return;
    }

    //Muestro cargando
    $('#cardConsulta').find('.cargando').stop(true, true).fadeIn(500);

    var url = ResolveUrl('~/Servicios/EstadisticaService.asmx/GetDatosEstadisticaMotivos');

    datosService = { consulta: getFiltrosConsulta() };

    crearAjax({
        Url: url,
        Data: datosService,
        OnSuccess: function (result) {

            //Oculto el cargando
            $('#cardConsulta').find('.cargando').stop(true, true).fadeOut(500);

            //mostrarCargando(false);

            if (!result.Ok) {
                mostrarMensaje('Error', result.Error);
                return;
            }

            var resultado = result.Return;

            //No hay resultados
            if (resultado.length == 0) {
                mostrarMensaje('Alerta', 'No hay requerimientos que coincidan con los filtros de búsqueda.');
                return;
            }

            //Muestro la otra card
            $('#cardConsulta').fadeOut(300, function () {
                $('#cardEstadisticas').fadeIn(300);
                $('#filtros').html(getTextoFiltrosConsulta());

                generarGrafico(result.Return, false);
                generarGrafico(result.Return, true);

                $('#chart-containerBarra').addClass('visible');
                $('#chart-containerTorta').removeClass('visible');
            });

        },
        OnError: function (result) {

            //Oculto el cargando
            $('#cardConsulta').find('.cargando').stop(true, true).fadeOut(500);

            //Informo
            mostrarMensaje('Error', 'Error al realizar la consulta');
        }
    });

}

var data_grafico;
var data_grilla;

let idGraficoTorta;
let idGraficoBarra;
function generarGrafico(estadisticas, torta) {

    data_grafico = estadisticas;

    var data = [];
    $.each(estadisticas, function (index, estadistica) {
        if (estadistica.Cantidad > 0) {
            data.push({
                label: toTitleCase(estadistica.Motivo),
                value: estadistica.Cantidad,
                toolText: "<div id='nameDiv'>" + toTitleCase(estadistica.Motivo) + "</div>{br}Cantidad: <b>" + estadistica.Cantidad + "</b>{br}Porcentaje: <b>" + estadistica.Porcentaje + "%</b>",
                link: 'j-clickGrafico-' + estadistica.IdMotivo
            });
        }
    });

    data_grilla = [];

    $.each(estadisticas, function (index, estadistica) {
        if (estadistica.Cantidad > 0) {
            data_grilla.push({
                nombre: toTitleCase(estadistica.Motivo),
                cantidad: estadistica.Cantidad,
                porcentaje: estadistica.Porcentaje
            });
        }
    });

    /*Uso underscore para obtener la suma total de los reclamos y asi agregarlo a l objeto para despues añadirlo a la grilla*/
    var total = _.reduce(estadisticas, function (memo, e) {
        return memo + e.Cantidad;
    }, 0);

    /*Agrego el total al objeto*/
    data_grilla.push({
        nombre: '<b>Total</b>',
        cantidad: total,
        porcentaje: '<font color="white">-1 </font>'
    });

    var tipo = !torta ? 'column2D' : 'pie3d';
    var verLabels = tipo == 'pie3d' ? false : true;

    /*Esto se hace porque fusin chart guarda lso ids de todos los graficos 
    en memoria entonces se le agrega en el otro metodo la fecha para q sea siempre unico*/
    let identificador;
    if (torta) {
        idGraficoTorta = 'graficoCPC-torta' + new Date().getTime();
        identificador = idGraficoTorta;
    } else {
        idGraficoBarra = 'graficoCPC-barra' + new Date().getTime();
        identificador = idGraficoBarra;
    }
    //var identificador = !torta ? 'graficoCPC-barra' : 'graficoCPC-torta';
    let container = torta ? 'chart-containerTorta' : 'chart-containerBarra';

    FusionCharts.ready(function () {
        var grafico = new FusionCharts({
            type: tipo,
            renderAt: container,
            width: '100%',
            height: '100%',
            dataFormat: 'json',
            id: identificador,
            dataSource: {
                "chart": {

                    "animation": 0,
                    "showLabels": verLabels, //los textos de cada categoria  
                    "maxlabelwidthpercent": "20",
                    "bgColor": "#fafafa",
                    "use3DLighting": "0",//Sin efecto sombra 3d
                    "legendBorderAlpha": "0",//Sin borde negro de la legenda                                      
                    "placeValuesInside": "0",//se ve el data label afuera
                    //Data Label
                    "placeValuesInside": "0",
                    "rotateValues": "0",
                    "valueFont": "Arial",
                    "placevaluesInside": "0",
                    "valueFontSize": "15",
                    "valueFontBold": "1",
                    "valueFontItalic": "0",
                    "valueFontAlpha": "90",
                    //////////////
                    "showShadow": "1",
                    "borderAlpha": "20",
                    "canvasBorderAlpha": "0",
                    "usePlotGradientColor": "0",
                    "plotBorderAlpha": "10",


                    "showXAxisLine": "1",
                    "xAxisLineColor": "#999999",
                    "divlineColor": "#999999",
                    "divLineIsDashed": "1",
                    "showAlternateHGridColor": "1",
                    "subcaptionFontBold": "0",
                    "subcaptionFontSize": "14",
                    "showLegend": "1",
                    "showTooltip": "1",
                    "showPercentValues": "1",
                    "centerLabelBold": "1",
                    "decimals": "2",
                    "captionFontSize": "24",
                    "subcaptionFontSize": "16",
                    "baseFontSize": "14",
                    "subcaptionFontBold": "0",
                    "yAxisName": "Cantidad de requerimientos",
                    //Exportacion
                    "exportEnabled": "1",
                    "exportFormats": "PNG=Imagen PNG|PDF=Archivo PDF|SVG=SVG",
                    "exportFileName": "EstadisticaCPC",
                    "theme": "fusion"

                },

                "data": data
            }
        });

        grafico.render(container, undefined, function () { });
    });
}
/*REPORTE*/
function obtenerBase64Grafico() {
    //Obtengo el SVG del grafico
    var svgBarra;
    var svgRadio;

    /*Esto se hace porque fusin chart guarda lso ids de todos los graficos 
 en memoria entonces se le agrega en el otro metodo la fecha para q sea siempre unico*/
    if (idGraficoBarra) {
        svgBarra = FusionCharts(idGraficoBarra).getSVGString();
    }
    if (idGraficoTorta) {
        svgRadio = FusionCharts(idGraficoTorta).getSVGString();
    }

    canvg(document.getElementById('canvasIdBarra'), svgBarra);
    canvg(document.getElementById('canvasIdRadio'), svgRadio);

    var canvasBarra = document.getElementById("canvasIdBarra");
    var canvasRadio = document.getElementById("canvasIdRadio");
    //Obtengo el Base64
    var imgBarra = canvasBarra.toDataURL("image/png");
    var imgRadio = canvasRadio.toDataURL("image/png");
    //le saco la primer parte al string y mando despeus de la coma

    var strSplitBarra = imgBarra.split(',')[1];

    var strSplitRadio = imgRadio.split(',')[1];

    var basesParaReporte = [];

    basesParaReporte.push(strSplitBarra);
    basesParaReporte.push(strSplitRadio);


    return basesParaReporte;
}
function probarGrilla() {
    html2canvas($("#tablaEstadistica")[0]).then(function (canvas) {
        var base64 = canvas.toDataURL("image/png");
        $("#previewImage").append(canvas);
    });
}
function clickGrafico(idMotivo) {
    $.each(data_grafico, function (index, data) {
        if (data.IdMotivo == idMotivo) {
            mostrarDetalle(data.Motivo, data.IdsRequerimientos);
        }
    });
}
function generarMapa() {

    let ids = [];
    $.each(data_grafico, function (index, element) {
        $.each(element.IdsRequerimientos, function (index2, element2) {
            ids.push(element2);
        });
    });

    crearDialogoMapaGoogleByIdsRequerimiento({
        Ids: ids,
        CallbackMensajes: function (tipo, mensaje) {
            mostrarMensaje(tipo, mensaje);
        }
    });
}

/*
Metodos para generar mapa de cpc
*/


function generarMapaCpc() {
    var datosMapa = getDatosCpcs(data_grafico);
    var dataAjax = { datosMapa: JSON.stringify(datosMapa) };
    dataAjax = JSON.stringify(dataAjax);


    var url = ResolveUrl('~/Servicios/RequerimientoService.asmx/GenerarMapaPorCpc');

    mostrarOverlay({ Texto: 'Generando mapa...' });
    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: dataAjax,
        url: url,
        success: function (result) {
            result = parse(result.d);

            ocultarOverlay();

            crearDialogoIFrame({
                Url: result.Url,
                Botones:
                    [
                        {
                            Texto: 'Aceptar',
                            Class: 'colorExito'
                        }
                    ]
            });
        },
        error: function (result) {
            ocultarOverlay();

            //Error
            Materialize.toast("Error generando el mapa", 5000, 'colorError');
            console.log("Error generando el mapa");
            console.log(dataAjax);
            console.log(result);
        }
    });
}

function getDatosCpcs(estadisticas) {

    var datos = {};

    var cpcs = [];
    $.each(estadisticas.CPCs, function (index, estadistica) {
        if (estadistica.Cantidad > 0) {
            cpcs.push({
                numero: toTitleCase(estadistica.Cpc.Numero),
                cantidad: estadistica.Cantidad,

            });
        }
    });


    datos = cpcs;
    return datos;
}

function getColor(valor) {

}

/*
*************************************
*/

function mostrarDetalle(motivo, ids) {
    var objeto = 'Requerimientos';

    var titulo = objeto + ' del Motivo ' + toTitleCase(motivo);


    crearDialogoRequerimientoListado({
        Ids: ids,
        Titulo: titulo,
        CallbackMensajes: function (tipo, mensaje) {
            mostrarMensaje(tipo, mensaje);
        }
    });
}

function mostrarMensaje(tipo, mensaje) {
    switch (tipo) {
        case 'Alerta':
            Materialize.toast(mensaje, 5000, 'colorAlerta');
            break;

        case 'Error':
            Materialize.toast(mensaje, 5000, 'colorError');
            break;

        case 'Exito':
            Materialize.toast(mensaje, 5000, 'colorExito');
            break;

        case 'Info':
            Materialize.toast(mensaje, 5000);
            break;
    }
}


/*
*************Tabla Estadistica************************
*/

function initTablaEstadistica() {

    $('#tablaEstadistica').DataTableGeneral({
        "Orden": [[1, "asc"]],
        Paginar: false,
        VerInfo: false,
        Columnas: [
            {
                title: "Motivo",
                data: "nombre",
                orderable: false,
                render: function (data, type, row) {
                    return '<div><span>' + data + '</span></div>';
                }
            },
            {
                title: 'Cantidad',
                data: "cantidad",
                Orderable: false,
                render: function (data, type, row) {
                    return '<div><span>' + data + '</span></div>';
                }
            },
            {
                title: "Porcentaje",
                data: "porcentaje",
                orderable: false,
                render: function (data, type, row) {
                    return '<div><span>' + data + '%' + '</span></div>';
                }
            },
        ]

    });
}


function cargarEstadistica() {
    var datos_grilla = data_grilla;

    var dt = $('#tablaEstadistica').DataTable();


    //Borro los datos
    dt.clear().draw();

    //Agrego la info nueva
    if (datos_grilla != null && datos_grilla != undefined) {
        dt.rows.add(datos_grilla).draw();
    }

    //Inicializo los tooltips
    dt.$('.tooltipped').tooltip({ delay: 50 });
}
