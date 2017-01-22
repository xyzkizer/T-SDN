class ServiceEndPointController < SDN

  get '/?' do
    content_type :json

    top = []
    @user = Manager.first(:id => session[:user_id])
    begin
      if @user
        user_seps = @user.seps.map{ |s| s.sep_id }
        JSON.parse($redis.get(%Q(hw_tsdn.node))).each do |node|
          top << {
            "name" => node,
            "nodes" => [
              {
                "name" => "ETH",
                "nodes" => JSON.parse($redis.get(%Q(#{node}.pktLink))).reject{|s|
                  @user.role != 'admin' and !user_seps.include? s
                }.map {|s|
                  {"name":s, "type":"eth"}
                }
              },
              {
                "name" => "ODU",
                "nodes" => JSON.parse($redis.get(%Q(#{node}.clientPort))).reject{|s|
                  @user.role != 'admin' and !user_seps.include? s
                }.map {|s|
                  {"name":s, "type":"odu"}
                }
              }
            ]
          }
        end
      else
        [401, %Q({"message":"user not exists."})]
      end
    rescue Exception => ex
      logger.error ex
    ensure
    end
    [200, top.to_json]
  end

  get %r{/(?<name>.+)/?} do
    sep = JSON.parse($redis.get(%Q(#{params[:name]})))
    sep.to_json
  end
end
