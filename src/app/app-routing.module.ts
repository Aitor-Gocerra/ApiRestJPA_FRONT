import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesComponent } from './components/clientes/clientes.component';
import { ProductosComponent } from './components/productos/productos.component';

const routes: Routes = [
  { path: '',          redirectTo: 'clientes', pathMatch: 'full' },
  { path: 'clientes',  component: ClientesComponent },
  { path: 'productos', component: ProductosComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
