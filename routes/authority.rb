class AuthorityController < SDN

  get '/authority' do
    flash_debug "GET authority"
    slim :'authority'
  end

end
