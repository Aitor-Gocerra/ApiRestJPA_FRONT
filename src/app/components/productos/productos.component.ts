import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

// jQuery y DataTables se cargan como scripts globales en angular.json
declare var $: any;

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit, AfterViewInit, OnDestroy {

  filtrosForm!: FormGroup;
  private dataTable: any;

  private readonly API_URL = 'http://localhost:8080/api-facturacion/productos';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filtrosForm = this.fb.group({
      nombre:   [''],
      precio:   [''],
      fechaDesde: [''],
      fechaHasta: ['']
    });
  }

  ngAfterViewInit(): void {
    this.inicializarDataTable();
  }

  private inicializarDataTable(): void {
    const self = this;

    this.dataTable = $('#tablaProductos').DataTable({
      serverSide: true,
      processing: true,
      ajax: {
        url: self.API_URL,
        type: 'POST',
        contentType: 'application/json',
        data: (params: any) => {
          // Añadimos los filtros custom a los parámetros estándar de DataTables
          params.filtroNombre   = self.filtrosForm.value.nombre   || '';
          params.filtroPrecio   = self.filtrosForm.value.precio   || '';
          params.filtroFechaDesde = self.filtrosForm.value.fechaDesde || '';
          params.filtroFechaHasta = self.filtrosForm.value.fechaHasta || '';
          return JSON.stringify(params);
        },
        error: (_xhr: any, _error: any, _thrown: any) => {
          console.error('Error al cargar los productos desde el servidor.');
        }
      },
      columns: [
        {
          data: 'id',
          title: 'ID',
          width: '60px'
        },
        {
          data: 'nombre',
          title: 'Nombre'
        },
        {
          data: 'precio',
          title: 'Precio (€)',
          render: (data: number) => {
            if (data == null) return '-';
            return new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR'
            }).format(data);
          }
        },
        {
          data: 'createdAt',
          title: 'Fecha de Creación',
          render: (data: string) => {
            if (!data) return '-';
            const fecha = new Date(data);
            return fecha.toLocaleDateString('es-ES', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            });
          }
        }
      ],
      order: [[0, 'asc']],
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50, 100],
      language: {
        processing:     'Procesando...',
        search:         'Buscar:',
        lengthMenu:     'Mostrar _MENU_ registros',
        info:           'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
        infoEmpty:      'Mostrando registros del 0 al 0 de un total de 0 registros',
        infoFiltered:   '(filtrado de un total de _MAX_ registros)',
        infoPostFix:    '',
        loadingRecords: 'Cargando...',
        zeroRecords:    'No se encontraron resultados',
        emptyTable:     'Ningún dato disponible en esta tabla',
        paginate: {
          first:    'Primero',
          previous: 'Anterior',
          next:     'Siguiente',
          last:     'Último'
        },
        aria: {
          sortAscending:  ': Activar para ordenar la columna de manera ascendente',
          sortDescending: ': Activar para ordenar la columna de manera descendente'
        }
      },
      responsive: true,
      dom: '<"d-flex justify-content-between align-items-center mb-2"lf>rtip'
    });
  }

  aplicarFiltros(): void {
    if (this.dataTable) {
      this.dataTable.ajax.reload();
    }
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    if (this.dataTable) {
      this.dataTable.ajax.reload();
    }
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}
