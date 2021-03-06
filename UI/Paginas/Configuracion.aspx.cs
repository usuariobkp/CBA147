﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.UI;
using Model;
using Model.Entities;
using Rules;
using Rules.Rules;
using UI.Controls.Navigation;
using UI.Resources;
using Intranet_UI.Utils;

namespace UI
{
    public partial class Configuracion : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            var dictionary = new Dictionary<string, object>();

            //var resultado = new RequerimientoRules(SessionKey.getUsuarioLogueado(Session)).SetearATI();

            var data = JsonUtils.toJson(dictionary);
            ScriptManager.RegisterClientScriptBlock(this, this.GetType(), "script", "$(function () { init( '" + data + "' ); });", true);
        }
    }
}