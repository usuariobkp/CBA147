﻿using Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Resultados
{
    [Serializable]
    public class Resultado_PermisoRequerimientoItem
    {
        public virtual string Nombre { get; set; }
        public virtual Enums.PermisoEstadoRequerimiento KeyValue { get; set; }
        public virtual int Posicion { get; set; }
        public Resultado_PermisoRequerimientoItem(PermisoEstadoRequerimiento x)
            : base()
        {
            this.Nombre = x.Nombre;
            this.KeyValue = x.KeyValue;
            this.Posicion = x.Posicion;
        }


    }
}
