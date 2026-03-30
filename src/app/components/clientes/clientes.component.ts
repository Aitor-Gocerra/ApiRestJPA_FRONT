import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';



@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  clientes: Cliente[] = [];
  clienteForm!: FormGroup;
  modoEdicion = false;
  clienteEditandoId: number | null = null;
  cargando = false;
  errorMensaje = '';
  exito = '';

  constructor(
    private clienteService: ClienteService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarClientes();
  }

  private inicializarFormulario(): void {
    this.clienteForm = this.fb.group({
      nombre:    ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email:     ['', [Validators.required, Validators.email]],
      foto:      ['']
    });
  }

  cargarClientes(): void {
    this.cargando = true;
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.cargando = false;
      },
      error: (err) => {
        this.errorMensaje = 'Error al cargar los clientes: ' + (err.message || err.statusText);
        this.cargando = false;
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.clienteEditandoId = null;
    this.clienteForm.reset();
    this.errorMensaje = '';
    this.exito = '';
  }

  abrirModalEditar(cliente: Cliente): void {
    this.modoEdicion = true;
    this.clienteEditandoId = cliente.id ?? null;
    this.clienteForm.patchValue({
      nombre:    cliente.nombre,
      apellidos: cliente.apellido,
      email:     cliente.email,
      foto:  cliente.foto ?? ''
    });
    this.errorMensaje = '';
    this.exito = '';
  }

  guardarCliente(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    const formValues = this.clienteForm.value;

    const datos: Cliente = {
      nombre: formValues.nombre,
      apellido: formValues.apellidos, 
      email: formValues.email,
      foto: formValues.foto
    };

    if (this.modoEdicion && this.clienteEditandoId !== null) {

      datos.id = this.clienteEditandoId; 
      
      this.clienteService.update(this.clienteEditandoId, datos).subscribe({
        next: () => {
          this.exito = 'Cliente actualizado correctamente.';
          this.cargarClientes();
          this.cerrarModal();
        },
        error: (err) => {
          this.errorMensaje = 'Error al actualizar el cliente: ' + (err.message || err.statusText);
        }
      });
    } else {
      this.clienteService.create(datos).subscribe({
        next: () => {
          this.exito = 'Cliente creado correctamente.';
          this.cargarClientes();
          this.cerrarModal();
        },
        error: (err) => {
          this.errorMensaje = 'Error al crear el cliente: ' + (err.message || err.statusText);
        }
      });
    }
  }

  eliminarCliente(cliente: Cliente): void {
    if (!cliente.id) return;

    const confirmar = confirm(
      `¿Seguro que deseas eliminar al cliente "${cliente.nombre} ${cliente.apellido}"?\n\n` +
      `⚠️ ATENCIÓN: Esta acción eliminará también todas las facturas asociadas a este cliente. Esta operación no se puede deshacer.`
    );

    if (!confirmar) return;

    this.clienteService.delete(cliente.id).subscribe({
      next: () => {
        this.exito = `Cliente "${cliente.nombre} ${cliente.apellido}" eliminado correctamente.`;
        this.cargarClientes();
      },
      error: (err) => {
        if (err.status === 409 || err.status === 500) {
          this.errorMensaje =
            'No se puede eliminar el cliente porque tiene facturas asociadas. ' +
            'Contacta con el administrador del sistema.';
        } else {
          this.errorMensaje = 'Error al eliminar el cliente: ' + (err.message || err.statusText);
        }
      }
    });
  }

  private cerrarModal(): void {
    const modalEl = document.getElementById('modalCliente');
    if (modalEl) {
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    }
  }

  get f() { return this.clienteForm.controls; }
}
