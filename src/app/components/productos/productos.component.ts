import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

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
      // 1. Transformamos ajax en una función
      ajax: (dataTablesParameters: any, callback: any) => {
        
        // 2. Traducimos los parámetros de DataTables a los que espera tu API
        // DataTables usa 'start' y 'length', tu API espera 'page' y 'limit'
        const page = dataTablesParameters.start / dataTablesParameters.length;
        const limit = dataTablesParameters.length;
        
        // Extraemos la columna por la que se está ordenando
        const orderColIndex = dataTablesParameters.order[0].column;
        const sort = dataTablesParameters.columns[orderColIndex].data;
        const order = dataTablesParameters.order[0].dir;

        // Construimos los HttpParams para una petición GET estándar
        let params = new HttpParams()
          .set('page', page.toString())
          .set('limit', limit.toString())
          .set('sort', sort)
          .set('order', order)
          .set('filtroNombre', self.filtrosForm.value.nombre || '')
          .set('filtroPrecio', self.filtrosForm.value.precio || '')
          .set('filtroFechaDesde', self.filtrosForm.value.fechaDesde || '')
          .set('filtroFechaHasta', self.filtrosForm.value.fechaHasta || '');

        // Hacemos la petición con Angular HttpClient
        self.http.get<any>(self.API_URL, { params })
          .pipe(
            // Convertimos tu 'PagedResponseDTO' al formato estricto que exige DataTables
            map((respuesta) => {
              return {
                draw: dataTablesParameters.draw,   // Parámetro de seguridad de DataTables
                recordsTotal: respuesta.total,          // Mapeamos el 'total' de tu API
                recordsFiltered: respuesta.total,       // DataTables requiere este campo para la paginación
                data: respuesta.data                    // Los datos reales (productos)
              };
            })
          )
          .subscribe({
            next: (dataTablesResponse) => {
              // Devolvemos los datos ya formateados a DataTables mediante el callback
              callback(dataTablesResponse);
            },
            error: (err) => {
              console.error('Error al cargar los productos desde el servidor.', err);
              // En caso de error, devolvemos una tabla vacía para que no se quede "Cargando..."
              callback({ draw: dataTablesParameters.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
            }
          });
      },
      columns: [
        { data: 'id', title: 'ID', width: '60px' },
        { data: 'nombre', title: 'Nombre' },
        {
          data: 'precio',
          title: 'Precio (€)',
          render: (data: number) => {
            if (data == null) return '-';
            return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(data);
          }
        },
        {
          data: 'createdAt',
          title: 'Fecha de Creación',
          render: (data: string) => {
            if (!data) return '-';
            const fecha = new Date(data);
            return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
          }
        }
      ],
      order: [[0, 'asc']],
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50, 100],
      language: { /* ... lo que ya tienes ... */ },
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
