﻿using System;
using System.Linq;
using Model.Entities;

namespace DAO.Maps
{
    class EstadoEmpleadoHistorialMap : BaseEntityMap<EstadoEmpleadoHistorial>
    {
        public EstadoEmpleadoHistorialMap()
        {
            //Tabla
            Table("EstadoEmpleadoHistorial");

            //Movil
            References(x => x.Empleado, "IdEmpleado").Not.Nullable();

            //Estado
            References(x => x.Estado, "IdEstado").Not.Nullable();

            //Estado
            Map(x => x.Ultimo, "Ultimo").Not.Nullable();

            //Fecha
            Map(x => x.Fecha, "Fecha").Not.Nullable();

        }
    }
}
