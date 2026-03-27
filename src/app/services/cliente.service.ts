import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private readonly apiUrl = 'http://localhost:8080/api-facturacion/clientes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  update(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  /**
   * Borrado físico del cliente.
   *
   * Decisión de diseño:
   * Dado que un cliente puede tener facturas asociadas, se ha optado por mostrar
   * al usuario una advertencia antes de eliminar, indicándole que también se
   * eliminarán todas sus facturas. La gestión del borrado en cascada
   * (facturas -> cliente) se delega al backend, que debe tener configurada la
   * relación con CascadeType.REMOVE o un DELETE manual previo en el servicio.
   * Si el backend devuelve un error (p. ej. constraint violation), se captura
   * y se muestra un mensaje informativo al usuario.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
