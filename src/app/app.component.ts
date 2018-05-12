import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy, Injectable } from '@angular/core';
//import { Http } from '@angular/http';
import { HttpClient } from "@angular/common/http";
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';

interface Bank {
 id: string;
 name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(protected httpClient: HttpClient) {}

  @Injectable()
  public getBanks(): Observable<Bank[]>   {

    return this.httpClient
        .get<Bank[]>("http://localhost:3000/banks");
  }
    /** control for the selected bank for multi-selection */
  public bankMultiCtrl: FormControl = new FormControl();

   /** control for the MatSelect filter keyword multi-selection */
  public bankMultiFilterCtrl: FormControl = new FormControl();

  /** list of banks */
  private banks: Bank[];


  /** list of banks filtered by search keyword for multi-selection */
  public filteredBanksMulti: ReplaySubject<Bank[]> = new ReplaySubject<Bank[]>(1);


  @ViewChild('multiSelect') multiSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  ngOnInit() {
    // set initial selection

    this.bankMultiCtrl.setValue([]);

    this.getBanks().subscribe(b => {
      this.banks = b;
    
      this.filteredBanksMulti.next(this.banks.slice());

    });


    // load the initial bank list
      this.bankMultiFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterBanksMulti();
        });

  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  private setInitialValue() {
    this.filteredBanksMulti
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.multiSelect.compareWith = (a: Bank, b: Bank) => a.id === b.id;
      });
  }

  private filterBanksMulti() {
    if (!this.banks) {
      return;
    }
    // get the search keyword
    let search = this.bankMultiFilterCtrl.value;
    if (!search) {
      this.filteredBanksMulti.next(this.banks.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredBanksMulti.next(
      this.banks.filter(bank => bank.name.toLowerCase().indexOf(search) == 0)
    );
  }

}
