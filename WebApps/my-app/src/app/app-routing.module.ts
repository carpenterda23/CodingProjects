import { NgModule } from '@angular/core';
import { RouterModule, Routes} from "@angular/router";
import { DialogueComponent} from "./dialogue/dialogue.component";
import { MainMenuComponent} from "./main-menu/main-menu.component";

const routes: Routes = [
  {path: 'dialogue', component: DialogueComponent},
  {path: 'mainmenu', component: MainMenuComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
