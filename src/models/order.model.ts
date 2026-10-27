export class OrderModel {
  // static toResponse(perfil: AdmPerfil) {
  //   return { 
  //     ...perfil, 
  //     cn_perfil: 
  //     perfil.cn_perfil.toString() 
  //   };
  // }

  static toParamResponse(status: {
    cn_status_os: bigint
    an_descr: string
  }) {
    return {
      id: status.cn_status_os.toString(),
      an_descr: status.an_descr,
    }
  }
}
