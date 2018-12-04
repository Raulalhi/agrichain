/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { IrrigationService } from './Irrigation.service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-irrigation',
  templateUrl: './Irrigation.component.html',
  styleUrls: ['./Irrigation.component.css'],
  providers: [IrrigationService]
})
export class IrrigationComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
  private errorMessage;

  irrigationID = new FormControl('', Validators.required);
  irrigationDate = new FormControl('', Validators.required);
  nitrogenKGs = new FormControl('', Validators.required);
  phosporousKGs = new FormControl('', Validators.required);
  potassiumKGs = new FormControl('', Validators.required);
  products = new FormControl('', Validators.required);

  constructor(public serviceIrrigation: IrrigationService, fb: FormBuilder) {
    this.myForm = fb.group({
      irrigationID: this.irrigationID,
      irrigationDate: this.irrigationDate,
      nitrogenKGs: this.nitrogenKGs,
      phosporousKGs: this.phosporousKGs,
      potassiumKGs: this.potassiumKGs,
      products: this.products
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceIrrigation.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(asset => {
        tempList.push(asset);
      });
      this.allAssets = tempList;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the asset field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the asset updateDialog.
   * @param {String} name - the name of the asset field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified asset field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.agrichain.crop.Irrigation',
      'irrigationID': this.irrigationID.value,
      'irrigationDate': this.irrigationDate.value,
      'nitrogenKGs': this.nitrogenKGs.value,
      'phosporousKGs': this.phosporousKGs.value,
      'potassiumKGs': this.potassiumKGs.value,
      'products': this.products.value
    };

    this.myForm.setValue({
      'irrigationID': null,
      'irrigationDate': null,
      'nitrogenKGs': null,
      'phosporousKGs': null,
      'potassiumKGs': null,
      'products': null
    });

    return this.serviceIrrigation.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'irrigationID': null,
        'irrigationDate': null,
        'nitrogenKGs': null,
        'phosporousKGs': null,
        'potassiumKGs': null,
        'products': null
      });
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
          this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else {
          this.errorMessage = error;
      }
    });
  }


  updateAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.agrichain.crop.Irrigation',
      'irrigationDate': this.irrigationDate.value,
      'nitrogenKGs': this.nitrogenKGs.value,
      'phosporousKGs': this.phosporousKGs.value,
      'potassiumKGs': this.potassiumKGs.value,
      'products': this.products.value
    };

    return this.serviceIrrigation.updateAsset(form.get('irrigationID').value, this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }


  deleteAsset(): Promise<any> {

    return this.serviceIrrigation.deleteAsset(this.currentId)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  setId(id: any): void {
    this.currentId = id;
  }

  getForm(id: any): Promise<any> {

    return this.serviceIrrigation.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'irrigationID': null,
        'irrigationDate': null,
        'nitrogenKGs': null,
        'phosporousKGs': null,
        'potassiumKGs': null,
        'products': null
      };

      if (result.irrigationID) {
        formObject.irrigationID = result.irrigationID;
      } else {
        formObject.irrigationID = null;
      }

      if (result.irrigationDate) {
        formObject.irrigationDate = result.irrigationDate;
      } else {
        formObject.irrigationDate = null;
      }

      if (result.nitrogenKGs) {
        formObject.nitrogenKGs = result.nitrogenKGs;
      } else {
        formObject.nitrogenKGs = null;
      }

      if (result.phosporousKGs) {
        formObject.phosporousKGs = result.phosporousKGs;
      } else {
        formObject.phosporousKGs = null;
      }

      if (result.potassiumKGs) {
        formObject.potassiumKGs = result.potassiumKGs;
      } else {
        formObject.potassiumKGs = null;
      }

      if (result.products) {
        formObject.products = result.products;
      } else {
        formObject.products = null;
      }

      this.myForm.setValue(formObject);

    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  resetForm(): void {
    this.myForm.setValue({
      'irrigationID': null,
      'irrigationDate': null,
      'nitrogenKGs': null,
      'phosporousKGs': null,
      'potassiumKGs': null,
      'products': null
      });
  }

}
