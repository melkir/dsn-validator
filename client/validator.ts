import { copy, exec } from "./deps.ts";

const __dirname = new URL(".", import.meta.url).pathname;

interface ValidatorArgs {
  version: string;
}

export class Validator {
  #version: string;

  constructor({ version }: ValidatorArgs) {
    this.#version = version;
  }

  async run(params: { path: string; dir: string }) {
    const vendorPath = `${params.dir}/${this.#version}`;
    await copy(`vendor/${this.#version}`, vendorPath);
    await exec(
      `${__dirname}${vendorPath}/Autocontrol-ValidateurModeBatchLinux64.sh -nc ${__dirname}${params.path}`,
    );
    const output = await Deno.readTextFile(`${params.path}.xml`);
    await Deno.remove(params.dir, { recursive: true });
    return output;
  }
}
