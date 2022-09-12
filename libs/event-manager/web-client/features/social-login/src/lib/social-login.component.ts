import { Component } from '@angular/core';
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/web3auth";


const clientId = "BDymsWXpQgrMblpPdoBkQ7UL37Wg4QMofK_0Mzg0zJmI3lTRaT6erPfl8i4sJssonHv9OqQeDd7fVksn_dmsvuU"; // get from https://dashboard.web3auth.io

@Component({
  selector: 'em-social-login',
  template: `
        <button
          (click)="onLogin()"
          class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
        >
          Connect with Social
        </button>
  `,
  providers: [],
})
export class SocialLoginComponent {

  web3auth: Web3Auth | null = null;
  provider: SafeEventEmitterProvider | null = null;
  isModalLoaded = false;

  async ngOnInit() {
    this.web3auth = new Web3Auth({
			clientId,
			chainConfig: {
			  chainNamespace: CHAIN_NAMESPACES.SOLANA,
			  chainId: "0x3", // 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet
			},
		});
		const web3auth = this.web3auth
    
		await web3auth.initModal();
    if (web3auth.provider) {
      await this.web3auth.logout();
      this.provider = web3auth.provider;
    }
    this.isModalLoaded = true;
  }
  
  async onLogin() {
    console.log("LOGIN");
    if (!this.web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    this.provider = await this.web3auth.connect();
  }
}
